
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

    const { prompt, modelType } = requestBody;
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Get the Gemini API key from environment variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    console.log('Calling Gemini API for image generation with prompt:', prompt);
    console.log('Using model type:', modelType);

    // Set model parameters based on the selected model type
    let temperature = 0.4;
    let enhancedPrompt = prompt;

    if (modelType === 'creative') {
      temperature = 0.9;
      enhancedPrompt = `Create a creative and artistic image of: ${prompt}. Use vibrant colors and artistic style.`;
    } else {
      // Standard model
      enhancedPrompt = `Create a photorealistic, high-quality image of: ${prompt}. Make it look professional and polished.`;
    }

    // Call Gemini 1.5 Pro to generate an image
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('API Response Data Structure:', Object.keys(responseData));

    // Extract the image part from the response
    let imagePart = null;
    if (responseData.candidates && responseData.candidates.length > 0) {
      const parts = responseData.candidates[0].content?.parts;
      if (parts && parts.length > 0) {
        imagePart = parts.find(part => part.inlineData?.mimeType?.startsWith('image/'));
      }
    }

    if (!imagePart || !imagePart.inlineData) {
      console.error('No image data found in the response');
      throw new Error('No image was generated. Please try with a different prompt.');
    }

    console.log('Successfully extracted image data from response');
    
    // Get the base64 image data
    const base64Image = imagePart.inlineData.data;
    
    if (!base64Image) {
      throw new Error('No image data in response');
    }

    // Get Supabase credentials
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
