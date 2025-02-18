
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context, celebrityData, userId } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Extract specific data points from celebrity data
    const postingInsights = celebrityData?.analytics?.posting_insights || {};
    const demographics = celebrityData?.analytics?.demographics || {};
    
    const bestTimes = postingInsights.peak_engagement_times || [];
    const generalBestTimes = postingInsights.general_best_times || {};
    const ageGroups = demographics.age_groups || {};
    const genderDist = demographics.gender || {};

    // Format posting times data
    const postingTimesInfo = bestTimes.length > 0 
      ? `Based on your data, your optimal engagement times are: ${bestTimes.join(', ')}.`
      : '';

    const demographicsInfo = Object.keys(ageGroups).length > 0
      ? `Your audience is primarily ${Object.entries(ageGroups)
          .sort(([, a], [, b]) => parseFloat(b) - parseFloat(a))
          .slice(0, 2)
          .map(([age, percentage]) => `${age} (${percentage}%)`)
          .join(' and ')} years old, with ${
            Object.entries(genderDist)
              .sort(([, a], [, b]) => parseFloat(b) - parseFloat(a))
              .map(([gender, percentage]) => `${gender} (${percentage}%)`)
              .join(' and ')
          }.`
      : '';

    // Determine if this is a timing-related question
    const isTimingQuestion = prompt.toLowerCase().includes('time') || 
                            prompt.toLowerCase().includes('when') ||
                            prompt.toLowerCase().includes('schedule');

    // Determine if this is a content-related question
    const isContentQuestion = prompt.toLowerCase().includes('post') ||
                            prompt.toLowerCase().includes('content') ||
                            prompt.toLowerCase().includes('create');

    // Build the system prompt based on question type
    const systemPrompt = `You are a social media expert providing personalized advice for ${celebrityData?.name || 'social media growth'}.

    ${celebrityData ? `Platform: ${celebrityData.platform}
    Current followers: ${celebrityData.analytics.followers.total}
    Engagement rate: ${celebrityData.analytics.engagement?.rate || 'N/A'}
    ${demographicsInfo}
    ${postingTimesInfo}` : ''}

    ${isTimingQuestion 
      ? `When discussing timing, be very specific about the optimal posting times based on the data provided.
         Include day-specific recommendations if available.`
      : isContentQuestion
      ? `When suggesting content, be creative and specific while considering:
         1. The audience demographics provided
         2. The optimal posting times for maximum engagement
         3. The platform-specific best practices
         Provide specific content ideas, not just general guidelines.`
      : `Provide specific, practical advice that's directly relevant to the question.
         Avoid generic suggestions and focus on actionable recommendations.`}

    Remember to:
    1. Be conversational and natural in your response
    2. Include specific examples and ideas
    3. Reference the audience data when relevant
    4. Mention optimal posting times when discussing content strategy`;

    const prompt_with_context = `${systemPrompt}\n\nUser: ${prompt}`;
    const result = await model.generateContent(prompt_with_context);
    const response = result.response;
    const text = response.text();

    // Store the conversation for future context
    await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        messages: [{
          role: 'user',
          content: prompt,
          timestamp: new Date().toISOString(),
        }, {
          role: 'assistant',
          content: text,
          timestamp: new Date().toISOString(),
        }]
      });

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
