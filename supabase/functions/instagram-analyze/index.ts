import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
};

const getAuthenticatedUser = async (supabase: any, authHeader: string | null) => {
  if (!authHeader) {
    console.error('No authorization header provided');
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    console.error('Failed to get user:', userError);
    throw new Error('Failed to get user');
  }

  return user;
};

const getInstagramToken = async (supabase: any, userId: string) => {
  const { data: tokenData, error: tokenError } = await supabase
    .from('instagram_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (tokenError) {
    console.error('Error fetching token:', tokenError);
    throw new Error('Failed to fetch Instagram token');
  }

  if (!tokenData) {
    throw new Error('Please connect your Instagram account first');
  }

  return tokenData;
};

const generateMockData = () => ({
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
});

const cacheAnalyticsData = async (supabase: any, userId: string, data: any) => {
  const { error: upsertError } = await supabase
    .from('instagram_cache')
    .upsert({ 
      username: userId,
      data,
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    console.error('Error caching data:', upsertError);
  }
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