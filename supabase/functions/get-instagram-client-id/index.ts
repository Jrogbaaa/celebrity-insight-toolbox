import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID')
    console.log('Retrieved Instagram Client ID:', clientId ? 'Found' : 'Not found')
    
    if (!clientId) {
      console.error('INSTAGRAM_CLIENT_ID environment variable is not set')
      throw new Error('Instagram client ID not configured')
    }

    return new Response(
      JSON.stringify({ 
        data: { clientId },
        error: null 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in get-instagram-client-id:', error.message)
    return new Response(
      JSON.stringify({ 
        data: null,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})