import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient, getAuthenticatedUser, getInstagramToken } from './auth.ts';
import { generateMockData, cacheAnalyticsData } from './mockData.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Instagram profile analysis');
    const supabase = createSupabaseClient();
    
    const user = await getAuthenticatedUser(supabase, req.headers.get('authorization'));
    console.log('Got user:', user.id);

    await getInstagramToken(supabase, user.id);
    
    const result = generateMockData();
    await cacheAnalyticsData(supabase, user.id, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in instagram-analyze function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: error.message.includes('No authorization header') || 
                error.message.includes('Failed to get user') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});