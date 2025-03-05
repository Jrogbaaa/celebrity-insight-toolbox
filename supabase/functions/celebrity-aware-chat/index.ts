
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const { messages } = await req.json()
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid messages format:', messages)
      return new Response(
        JSON.stringify({ error: 'Invalid messages format. Expected non-empty array' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing chat with messages:', messages.length)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get celebrity data from AI configuration
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configuration')
      .select('configuration')
      .eq('provider', 'gemini')
      .eq('model_name', 'gemini-pro')
      .single()

    if (configError) {
      console.error('Error fetching AI configuration:', configError)
    }

    const celebrityData = aiConfig?.configuration?.celebrity_data || {}
    console.log('Retrieved celebrity data config:', Object.keys(celebrityData).length, 'celebrities')

    // Create context from celebrity data
    const celebrityContext = Object.entries(celebrityData)
      .map(([username, data]) => {
        const celeb = data as any
        return `${celeb.name} (@${username}) on ${celeb.platform}: ${JSON.stringify(celeb.report)}`
      })
      .join('\n\n')

    console.log('Generated celebrity context of length:', celebrityContext.length)

    // Initialize Gemini with updated API
    const apiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    // Updated to use the latest model ID format
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Create chat session with context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: `You are a social media analytics expert with detailed knowledge about these celebrities:\n\n${celebrityContext}\n\nUse this information to provide insights and answer questions about these celebrities' social media performance.`,
        },
        {
          role: "model",
          parts: "I understand that I am a social media analytics expert with access to detailed data about specific celebrities. I will use this information to provide insights and answer questions about their social media performance, engagement rates, and growth trends.",
        },
      ],
    });

    console.log('Sending message to Gemini:', messages[messages.length - 1].content.substring(0, 100) + '...')
    
    try {
      // Send the latest message to Gemini
      const result = await chat.sendMessage(messages[messages.length - 1].content)
      const response = await result.response
      const text = response.text()

      console.log('Received response from Gemini of length:', text.length)

      return new Response(
        JSON.stringify({ generatedText: text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (chatError) {
      console.error('Error in chat generation:', chatError)
      // Fallback to a simple response when the AI fails
      return new Response(
        JSON.stringify({ 
          generatedText: "I'm sorry, but I couldn't process your request at this time. The AI service is experiencing technical difficulties. Please try again later.",
          error: chatError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in celebrity-aware-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request', 
        details: error.message,
        generatedText: "I apologize, but I'm having trouble processing your request. Please try again later."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
