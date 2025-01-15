import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { recipientId, messageText } = await req.json()
    
    if (!recipientId || !messageText) {
      throw new Error('Recipient ID and message text are required')
    }

    // Get the user's token from the database
    const authHeader = req.headers.get('authorization')?.split(' ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    if (userError || !user) {
      throw new Error('Failed to get user')
    }

    // Get the user's Instagram token
    const { data: tokenData, error: tokenError } = await supabase
      .from('instagram_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('No Instagram token found')
    }

    // Send message using Instagram Graph API
    const response = await fetch(
      'https://graph.instagram.com/v21.0/me/messages',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: messageText }
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to send message')
    }

    // Store the message in our database
    const { error: insertError } = await supabase
      .from('instagram_messages')
      .insert({
        user_id: user.id,
        recipient_id: recipientId,
        message_text: messageText,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error storing message:', insertError)
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.message_id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending message:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})