
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

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

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Create a chat session with some initial context about being a social media expert
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: "You are a social media analytics expert. You specialize in analyzing metrics, engagement patterns, and providing strategic insights for social media growth across platforms like Instagram, TikTok, and YouTube.",
        },
        {
          role: "model",
          parts: "I understand that I am a social media analytics expert. I will focus on providing detailed analysis of social media metrics, engagement patterns, and strategic recommendations based on data across Instagram, TikTok, YouTube, and other platforms. I'll help interpret trends, identify growth opportunities, and suggest data-driven strategies for improving social media performance.",
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    const result = await chat.sendMessage(prompt + (context ? `\nContext: ${context}` : ''))
    const response = await result.response
    const text = response.text()

    return new Response(
      JSON.stringify({ response: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
