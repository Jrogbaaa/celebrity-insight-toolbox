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

    const data = await response.json();
    console.log('DeepSeek API response:', data);

    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      
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