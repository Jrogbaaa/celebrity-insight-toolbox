
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

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid messages format',
          generatedText: "I couldn't process your request due to an invalid message format. Please try again with a proper message structure."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing chat with messages:', messages.length);

    // Updated system message to focus on social media expertise
    const apiMessages = [
      { 
        role: 'system', 
        content: `You are a specialized social media expert AI assistant that helps users with their social media concerns and questions. Your expertise includes:
        - Social media strategy and content planning
        - Engagement optimization and best practices
        - Platform-specific advice (Instagram, Twitter, Facebook, LinkedIn, TikTok)
        - Content creation and optimization
        - Audience growth and retention strategies
        - Social media analytics and metrics interpretation
        - Crisis management and reputation handling
        - Hashtag strategies and trending topics
        - Best times to post and content scheduling
        - Community management and engagement
        
        Provide practical, actionable advice and always stay focused on social media-related topics. If a question is not related to social media, politely redirect the conversation back to social media topics.`
      },
      ...messages
    ];

    console.log('Sending request to DeepSeek API');

    if (!deepseekApiKey) {
      console.error('DeepSeek API key is not set');
      return new Response(
        JSON.stringify({ 
          error: 'API key is not configured',
          generatedText: "I'm sorry, but our AI service is not properly configured at the moment. Please try again later."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.95,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({
              error: "Rate Limit Exceeded",
              details: "The API is currently rate limited. Please try again in a few minutes.",
              generatedText: "I'm sorry, but our AI service is currently experiencing high demand. Please try again in a few minutes."
            }), {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'External API error', 
            details: errorText,
            generatedText: "I apologize, but there was an issue connecting to our AI service. Please try again later."
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }

      const data = await response.json();
      console.log('DeepSeek API response received');

      const generatedText = data.choices[0].message.content;

      return new Response(JSON.stringify({ generatedText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error('Error calling DeepSeek API:', apiError);
      return new Response(
        JSON.stringify({
          error: apiError instanceof Error ? apiError.message : 'Error calling AI service',
          generatedText: "I apologize, but I'm having trouble connecting to my knowledge service. Please try again later."
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in deepseek-chat function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : 'Unknown error',
        generatedText: "I apologize for the inconvenience, but I encountered an unexpected error. Please try again later."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
