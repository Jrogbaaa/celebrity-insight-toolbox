import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('Starting Instagram profile analysis');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization')?.split(' ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Failed to get user');
    }

    // Get user's Instagram token
    const { data: tokenData, error: tokenError } = await supabase
      .from('instagram_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Please connect your Instagram account first');
    }

    // For now, return mock data since we haven't implemented the Instagram API calls yet
    console.log('Generating mock data for authenticated user');
    const result = {
      followers: Math.floor(Math.random() * 100000) + 10000,
      engagementRate: Number((Math.random() * 5 + 1).toFixed(2)),
      commentsPerPost: Math.floor(Math.random() * 50) + 10,
      sharesPerPost: Math.floor(Math.random() * 30) + 5,
      recentPosts: Array.from({ length: 6 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }),
        engagement: Math.floor(Math.random() * 5000) + 1000
      })),
      posts: Array.from({ length: 6 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 2000) + 500,
        comments: Math.floor(Math.random() * 100) + 20
      }))
    };

    // Cache the result
    const { error: upsertError } = await supabase
      .from('instagram_cache')
      .upsert({ 
        username: user.id, // Using user.id as username for now
        data: result,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error('Error caching data:', upsertError);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing Instagram profile:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});