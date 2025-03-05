
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, context } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing chat request:', { prompt, contextLength: context?.length || 0 })

    const apiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Initialize the Google Generative AI with updated API version
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the most current model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare system prompt for social media expertise
    const systemPrompt = `You are a specialized social media expert AI assistant that helps users with their social media concerns and questions. 
    Your expertise includes:
    - Social media strategy and content planning
    - Engagement optimization and best practices
    - Platform-specific advice (Instagram, Twitter, Facebook, LinkedIn, TikTok)
    - Content creation and optimization
    - Audience growth and retention strategies
    - Social media analytics and metrics interpretation
    - Crisis management and reputation handling
    - Hashtag strategies and trending topics
    - Best times to post and content scheduling
    - Community management and engagement`;

    // Combine previous context if available
    const fullPrompt = context 
      ? `${systemPrompt}\n\nPrevious messages: ${context}\n\nUser: ${prompt}`
      : `${systemPrompt}\n\nUser: ${prompt}`;

    console.log('Sending request to Gemini API...');

    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Received response from Gemini of length:', text.length);

      return new Response(
        JSON.stringify({ generatedText: text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (genError) {
      console.error('Error generating content:', genError);
      
      // Provide a fallback response when the AI fails
      return new Response(
        JSON.stringify({ 
          generatedText: "I'm sorry, but I couldn't process your request at this time. Our AI service is experiencing technical difficulties. Please try again later.",
          error: genError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        generatedText: "I apologize, but there was an error processing your request. Please try again later."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
