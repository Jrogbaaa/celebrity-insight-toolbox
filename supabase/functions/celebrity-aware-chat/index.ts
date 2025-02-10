
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { messages } = await req.json()

    // Get celebrity data from AI configuration
    const { data: aiConfig } = await supabase
      .from('ai_configuration')
      .select('configuration')
      .eq('provider', 'gemini')
      .eq('model_name', 'gemini-pro')
      .single()

    const celebrityData = aiConfig?.configuration?.celebrity_data || {}

    // Create context from celebrity data
    const celebrityContext = Object.entries(celebrityData)
      .map(([username, data]) => {
        const celeb = data as any
        return `${celeb.name} (@${username}) on ${celeb.platform}: ${JSON.stringify(celeb.report)}`
      })
      .join('\n\n')

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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
    })

    const result = await chat.sendMessage(messages[messages.length - 1].content)
    const response = await result.response
    const text = response.text()

    return new Response(
      JSON.stringify({ generatedText: text }),
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
