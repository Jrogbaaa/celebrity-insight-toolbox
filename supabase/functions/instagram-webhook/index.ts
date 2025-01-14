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
    const url = new URL(req.url);
    
    // Handle webhook verification
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification request:', { mode, token, challenge });

      // Verify that the callback came from Facebook
      if (mode === 'subscribe' && token === Deno.env.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN')) {
        console.log('Webhook verified');
        return new Response(challenge, { 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          status: 200 
        });
      } else {
        console.error('Failed webhook verification');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Handle webhook updates
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received webhook:', body);

      // Here you can process different types of updates
      // For now, we'll just log them
      
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
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});