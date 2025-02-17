
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);

    const { prompt } = requestBody;
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    console.log('Calling Imagen API with prompt:', prompt);

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-002:generateImages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        prompt: {
          text: prompt
        },
        numberOfImages: 1
      }),
    });

    // Log the raw response
    const rawResponse = await response.text();
    console.log('Raw API Response:', rawResponse);

    // Try to parse the response
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      throw new Error(`Invalid JSON response from API: ${rawResponse}`);
    }

    if (!response.ok) {
      console.error('API Error:', responseData);
      throw new Error(`API error: ${JSON.stringify(responseData)}`);
    }

    if (!responseData.images?.[0]?.bytes) {
      console.error('Invalid response format:', responseData);
      throw new Error('No image data in response');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create storage bucket if it doesn't exist
    try {
      const { error: bucketError } = await supabase
        .storage
        .createBucket('generated-images', {
          public: true,
          fileSizeLimit: 50000000
        });

      if (bucketError && !bucketError.message.includes('already exists')) {
        throw bucketError;
      }
    } catch (error) {
      console.error('Bucket Error:', error);
      throw new Error('Failed to create/check storage bucket');
    }

    // Process image data
    const imageBytes = Uint8Array.from(atob(responseData.images[0].bytes), c => c.charCodeAt(0));
    const imageBlob = new Blob([imageBytes], { type: 'image/png' });
    const fileName = `${crypto.randomUUID()}.png`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ response: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
