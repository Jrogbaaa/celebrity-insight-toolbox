
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    // Configure request to Google Cloud Speech-to-Text API
    const apiKey = Deno.env.get('GCP_API_KEY');
    
    if (!apiKey) {
      throw new Error('GCP API key not configured');
    }

    console.log('Sending request to Google Speech-to-Text API...');

    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'default',
        },
        audio: {
          content: audio,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Speech API error:', errorData);
      throw new Error(`Google Speech API error: ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('Speech recognition result:', result);

    let transcription = '';
    if (result.results && result.results.length > 0) {
      transcription = result.results.map((r: any) => 
        r.alternatives[0].transcript
      ).join(' ');
    }

    return new Response(
      JSON.stringify({ text: transcription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in speech-to-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
