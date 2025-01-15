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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { signed_request } = await req.json()
    
    if (!signed_request) {
      throw new Error('No signed request provided')
    }

    // Parse the signed request
    const [encodedSig, payload] = signed_request.split('.')
    const data = JSON.parse(atob(payload))
    
    // Delete all Instagram-related data for this user
    const { error } = await supabase
      .from('instagram_tokens')
      .delete()
      .eq('user_id', data.user_id)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        url: `https://celebrity-insight-toolbox-ygweyscocelwjcqinkth.supabase.co/instagram-data-deletion`,
        confirmation_code: data.user_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})