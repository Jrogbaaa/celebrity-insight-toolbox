
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

    // Fetch historical context
    const { data: chatHistory } = await supabase
      .from('chat_conversations')
      .select('messages')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch all reports for this celebrity to analyze patterns
    const { data: celebrityReports } = await supabase
      .from('celebrity_reports')
      .select('*')
      .eq('celebrity_name', celebrityData?.name)
      .order('report_date', { ascending: false });

    // Build learning context from historical data
    const learningContext = {
      chatHistory: chatHistory?.map(chat => chat.messages).flat() || [],
      reportHistory: celebrityReports || [],
      trends: analyzeTrends(celebrityReports || []),
    };

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `You are an expert social media consultant with access to historical data and learning context.
      ${buildHistoricalContext(learningContext)}
      
      Current analysis for ${celebrityData?.name || 'general social media'}:
      ${celebrityData ? `
      - Platform: ${celebrityData.platform}
      - Current followers: ${celebrityData.analytics.followers.total}
      - Engagement rate: ${celebrityData.analytics.engagement?.rate || 'N/A'}
      - Historical trends: ${JSON.stringify(learningContext.trends)}
      ` : ''}
      
      Use this historical context to provide personalized, data-driven recommendations.
      Structure your response as:
      1. Trend Analysis (based on historical data)
      2. Specific Action Items
      3. Expected Outcomes (with historical evidence)`;

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

function analyzeTrends(reports: any[]) {
  if (!reports.length) return {};
  
  // Analyze historical trends
  const trends = {
    followerGrowth: calculateGrowthRate(reports, 'followers'),
    engagementTrends: calculateEngagementTrends(reports),
    contentPatterns: identifySuccessfulContent(reports),
  };
  
  return trends;
}

function calculateGrowthRate(reports: any[], metric: string) {
  // Sort reports by date
  const sortedReports = [...reports].sort((a, b) => 
    new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
  );
  
  if (sortedReports.length < 2) return 'Insufficient data';
  
  const oldestValue = sortedReports[0].report_data.followers.total;
  const newestValue = sortedReports[sortedReports.length - 1].report_data.followers.total;
  const monthsDiff = monthsBetween(
    new Date(sortedReports[0].report_date),
    new Date(sortedReports[sortedReports.length - 1].report_date)
  );
  
  if (monthsDiff === 0) return 'Insufficient time range';
  
  const growthRate = ((newestValue - oldestValue) / oldestValue) * 100 / monthsDiff;
  return `${growthRate.toFixed(2)}% per month`;
}

function calculateEngagementTrends(reports: any[]) {
  const engagementRates = reports.map(report => ({
    date: report.report_date,
    rate: report.report_data.engagement?.rate || 0
  }));
  
  return engagementRates;
}

function identifySuccessfulContent(reports: any[]) {
  // Analyze which content types and posting times have been most successful
  const patterns = {
    bestPerformingContent: [],
    optimalPostingTimes: [],
  };
  
  reports.forEach(report => {
    if (report.report_data.posting_insights) {
      patterns.bestPerformingContent.push(...report.report_data.posting_insights.posting_tips);
      patterns.optimalPostingTimes.push(...report.report_data.posting_insights.peak_engagement_times);
    }
  });
  
  return patterns;
}

function monthsBetween(date1: Date, date2: Date) {
  const yearsDiff = date2.getFullYear() - date1.getFullYear();
  const monthsDiff = date2.getMonth() - date1.getMonth();
  return yearsDiff * 12 + monthsDiff;
}

function buildHistoricalContext(context: any) {
  const { chatHistory, trends } = context;
  
  let historicalInsights = 'Historical Context:\n';
  
  if (trends.followerGrowth) {
    historicalInsights += `- Growth Rate: ${trends.followerGrowth}\n`;
  }
  
  if (trends.contentPatterns?.bestPerformingContent?.length > 0) {
    historicalInsights += '- Previously Successful Content Strategies:\n';
    trends.contentPatterns.bestPerformingContent
      .slice(0, 3)
      .forEach((pattern: string) => {
        historicalInsights += `  * ${pattern}\n`;
      });
  }
  
  return historicalInsights;
}
