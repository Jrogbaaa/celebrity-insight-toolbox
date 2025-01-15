import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // For webhook verification from Instagram
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const verifyToken = Deno.env.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN');

      // Enhanced logging for debugging
      console.log('Webhook verification request:', {
        requestUrl: req.url,
        mode,
        token,
        challenge,
        verifyTokenExists: !!verifyToken,
        headers: Object.fromEntries(req.headers.entries())
      });

      if (!mode || !token) {
        console.error('Missing mode or token');
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (mode !== 'subscribe') {
        console.error(`Invalid mode: ${mode}`);
        return new Response(JSON.stringify({ error: 'Invalid mode' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (token !== verifyToken) {
        console.error('Token verification failed:', {
          receivedToken: token,
          expectedTokenLength: verifyToken?.length || 0
        });
        return new Response(JSON.stringify({ error: 'Invalid verify token' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Verification successful, returning challenge:', challenge);
      return new Response(challenge, {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 200
      });
    }

    // For actual webhook events from Instagram
    if (req.method === 'POST') {
      const payload = await req.json();
      console.log('Received webhook event:', JSON.stringify(payload, null, 2));

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});