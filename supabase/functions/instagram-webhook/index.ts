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

      console.log('Webhook verification request received:', {
        mode,
        token,
        challenge,
        verifyToken,
        fullUrl: req.url
      });

      // Verify the mode and token
      if (!mode || !token || !challenge) {
        console.error('Missing required parameters');
        return new Response('Missing parameters', {
          headers: corsHeaders,
          status: 400
        });
      }

      if (mode !== 'subscribe') {
        console.error(`Invalid mode: ${mode}`);
        return new Response('Invalid mode', {
          headers: corsHeaders,
          status: 400
        });
      }

      if (token !== verifyToken) {
        console.error('Token mismatch:', {
          received: token,
          expected: verifyToken
        });
        return new Response('Invalid verify token', {
          headers: corsHeaders,
          status: 403
        });
      }

      console.log('Webhook verified successfully, returning challenge:', challenge);
      return new Response(challenge, {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 200
      });
    }

    // For actual webhook events from Instagram
    if (req.method === 'POST') {
      const payload = await req.json();
      console.log('Received webhook event:', JSON.stringify(payload, null, 2));

      // Handle different types of webhook events
      if (payload.object === 'instagram') {
        for (const entry of payload.entry) {
          // Log each change in the webhook
          for (const change of entry.changes) {
            console.log('Processing change:', {
              field: change.field,
              value: change.value
            });
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response('Method not allowed', {
      headers: corsHeaders,
      status: 405
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});