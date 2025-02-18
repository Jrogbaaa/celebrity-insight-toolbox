
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context, celebrityData } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = celebrityData
      ? `You are an expert social media consultant analyzing data for ${celebrityData.name} on ${celebrityData.platform}. 
         Focus on providing specific, actionable recommendations based on their analytics data:
         - Current followers: ${celebrityData.analytics.followers.total}
         - Engagement rate: ${celebrityData.analytics.engagement?.rate || 'N/A'}
         - Demographics: ${JSON.stringify(celebrityData.analytics.demographics || {})}
         
         Always structure your responses as:
         1. Data-backed observation
         2. Specific action items
         3. Expected outcomes
         
         Avoid generic advice - everything should be tailored to their specific metrics and platform.`
      : `You are an expert social media consultant. Provide specific, actionable recommendations.
         Structure your responses as:
         1. Strategy overview
         2. Specific action items
         3. Expected outcomes
         
         Focus on concrete steps and measurable results.`;

    const prompt_with_context = `${systemPrompt}\n\nUser: ${prompt}`;

    const result = await model.generateContent(prompt_with_context);
    const response = result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ response: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
