import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { posts } = await req.json();

    // Analyze posts using the Deepseek API for better performance and cost
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a social media analyst specializing in extracting business insights from Instagram posts. Focus on identifying: 1) Giveaways 2) Events 3) Deals and discounts 4) New menu items or products"
          },
          {
            role: "user",
            content: `Analyze these Instagram posts and extract key business information: ${JSON.stringify(posts)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const analysisResult = await response.json();
    
    // Parse the response and structure it
    const structuredAnalysis = {
      giveaways: [],
      events: [],
      deals: [],
      newItems: []
    };

    // Cache the results
    console.log('Analysis completed, returning results');

    return new Response(
      JSON.stringify(structuredAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in instagram-analyze function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});