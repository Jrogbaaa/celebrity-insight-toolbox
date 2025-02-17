
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

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Log the raw response
    const rawResponse = await response.text();
    console.log('Raw API Response:', rawResponse);

    // Check if response is valid JSON before parsing
    if (!rawResponse) {
      throw new Error('Empty response from API');
    }

    // Try to parse the response
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
      console.log('Parsed response data:', responseData);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      throw new Error(`Invalid JSON response from API: ${rawResponse}`);
    }

    if (!response.ok) {
      console.error('API Error:', responseData);
      throw new Error(`API error: ${JSON.stringify(responseData)}`);
    }

    // Extract the image data from the response
    const generatedContent = responseData.candidates?.[0]?.content;
    if (!generatedContent) {
      throw new Error('No content generated from API');
    }

    const imageBase64 = generatedContent.parts?.[0]?.text;
    if (!imageBase64) {
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
    const imageBytes = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
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
