
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Received request body:', requestBody);
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      throw new Error('Invalid JSON in request body');
    }

    const { prompt } = requestBody;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    console.log('Calling Imagen API with prompt:', prompt);

    // Call Google's Imagen API
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

    let responseData;
    try {
      responseData = await response.json();
      console.log('Raw Imagen API response:', JSON.stringify(responseData));
    } catch (error) {
      console.error('Error parsing Imagen API response:', error);
      throw new Error('Failed to parse Imagen API response');
    }

    if (!response.ok) {
      console.error('Imagen API error response:', responseData);
      throw new Error(`Imagen API error: ${JSON.stringify(responseData)}`);
    }

    if (!responseData.images?.[0]?.bytes) {
      console.error('Invalid response format:', responseData);
      throw new Error('No image data received from Imagen API');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      // Create a storage bucket if it doesn't exist
      const { error: bucketError } = await supabase
        .storage
        .createBucket('generated-images', {
          public: true,
          fileSizeLimit: 50000000
        });

      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Bucket creation error:', bucketError);
        throw bucketError;
      }
    } catch (error) {
      console.error('Error creating/checking bucket:', error);
      throw new Error('Failed to create/check storage bucket');
    }

    // Process image data
    let imageBlob;
    try {
      const imageBytes = Uint8Array.from(atob(responseData.images[0].bytes), c => c.charCodeAt(0));
      imageBlob = new Blob([imageBytes], { type: 'image/png' });
    } catch (error) {
      console.error('Error processing image data:', error);
      throw new Error('Failed to process image data');
    }

    const fileName = `${crypto.randomUUID()}.png`;

    // Upload to Supabase Storage
    try {
      const { error: uploadError } = await supabase.storage
        .from('generated-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload generated image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ response: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
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
