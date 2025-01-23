import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

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
    const { prompt } = await req.json();

    console.log('Received prompt:', prompt);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-1.5-chat',
        messages: [
          { role: 'system', content: 'You are a helpful AI content expert that helps users generate creative and engaging content.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.95,  // Added for better text generation
        frequency_penalty: 0.0,  // Added to maintain natural word frequency
        presence_penalty: 0.0,   // Added to maintain topic consistency
      }),
    });

    const data = await response.json();
    console.log('DeepSeek API response:', data);

    if (!response.ok) {
      // Log the full error response for debugging
      console.error('DeepSeek API error:', data);
      
      if (data.error?.message?.includes('rate limit')) {
        return new Response(
          JSON.stringify({
            error: "Rate Limit Exceeded",
            details: "The API is currently rate limited. Please try again in a few minutes."
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Handle model-related errors
      if (data.error?.message?.includes('model')) {
        return new Response(
          JSON.stringify({
            error: "Model Error",
            details: "There was an issue with the AI model. Please try again later."
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw new Error(data.error?.message || 'Failed to generate content');
    }

    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in deepseek-chat function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});