
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Calling Imagen API with prompt:', prompt);

    // Call Google's Imagen API to generate image
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/imagen:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        prompt: {
          text: prompt
        },
        parameters: {
          sampleCount: 1,  // Number of images to generate
          height: 1024,    // Image height
          width: 1024      // Image width
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Imagen API error:', errorData);
      throw new Error(`Imagen API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Imagen API response:', result);

    if (!result.media || !result.media[0]?.uri) {
      throw new Error('Invalid response from Imagen API');
    }

    // Get the generated image data
    const imageBase64 = result.media[0].uri;
    
    // Convert base64 to blob
    const base64Response = await fetch(imageBase64);
    const blob = await base64Response.blob();
    
    const fileName = `${crypto.randomUUID()}.png`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ response: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in image generation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
