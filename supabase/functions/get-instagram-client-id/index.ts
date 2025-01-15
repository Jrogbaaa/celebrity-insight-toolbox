import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Instagram client ID retrieval process...');
    console.log('Environment check:', {
      hasClientId: !!Deno.env.get('INSTAGRAM_CLIENT_ID'),
      availableEnvVars: Object.keys(Deno.env.toObject())
    });

    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
    
    if (!clientId) {
      console.error('Instagram client ID not found in environment variables');
      throw new Error('Instagram client ID not configured');
    }

    console.log('Successfully retrieved Instagram client ID');
    return new Response(
      JSON.stringify({ 
        clientId,
        status: 'success'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in get-instagram-client-id function:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error',
        details: 'Check function logs for more information'
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});