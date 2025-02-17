
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

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro-vision-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            inlineData: {
              mimeType: "text/plain",
              data: prompt
            }
          }]
        }]
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('API Response Data:', JSON.stringify(responseData, null, 2));

    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Unexpected response format from API');
    }

    // Get the base64 image data
    const base64Image = responseData.candidates[0].content.parts[0].text;
    
    if (!base64Image) {
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

    // Convert base64 to bytes
    const imageBytes = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
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
        details: error.stack,
        type: 'FunctionError'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
