
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);

    const { prompt, modelType } = requestBody;
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Forward all requests to the replicate-image function, as Gemini isn't working reliably
    console.log('Forwarding request to replicate-image function');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Use the modelType from the request or default to "flux"
    const replicateModelType = modelType === "creative" ? "flux" : (modelType || "flux");
    
    const { data: replicateResponse, error: replicateError } = await supabase.functions.invoke('replicate-image', {
      body: { prompt, modelType: replicateModelType }
    });
    
    if (replicateError) {
      console.error('Replicate function error:', replicateError);
      throw new Error(`Replicate API error: ${replicateError.message}`);
    }
    
    console.log('Replicate response:', replicateResponse);
    return new Response(
      JSON.stringify(replicateResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        type: 'FunctionError'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
