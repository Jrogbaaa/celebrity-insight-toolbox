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
    const { messages } = await req.json();

    console.log('Received messages:', messages);

    // Prepare messages array with system message
    const apiMessages = [
      { 
        role: 'system', 
        content: 'You are a helpful AI content expert that helps users generate creative and engaging content.' 
      },
      ...messages
    ];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',  // Using the general chat model
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.95,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    const data = await response.json();
    console.log('DeepSeek API response:', data);

    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      
      // Check for insufficient balance error
      if (data.error?.message?.includes('insufficient') || data.error?.message?.includes('balance')) {
        return new Response(
          JSON.stringify({
            error: "Insufficient Balance",
            details: "The AI service is currently unavailable due to insufficient credits. Please try again later or contact support."
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

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

      throw new Error(data.error?.message || 'Failed to generate content');
    }

    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in deepseek-chat function:', error);
    
    // Check if the error is related to insufficient balance
    if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
      return new Response(
        JSON.stringify({
          error: "Insufficient Balance",
          details: "The AI service is currently unavailable due to insufficient credits. Please try again later or contact support."
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
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