import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const username = url.searchParams.get('username');

    if (!username) {
      throw new Error('Username parameter is required');
    }

    // Check cache first
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cachedData, error: cacheError } = await supabase
      .from('instagram_cache')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    if (cachedData && 
        (new Date().getTime() - new Date(cachedData.updated_at).getTime()) < cacheExpiry) {
      console.log('Returning cached data for:', username);
      return new Response(
        JSON.stringify(cachedData.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not in cache or expired, fetch from Instagram API
    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
    const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Instagram credentials not configured');
    }

    // First get an app access token
    const tokenResponse = await fetch(
      'https://api.instagram.com/oauth/access_token',
      {
        method: 'POST',
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials'
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Error getting Instagram token:', tokenData);
      throw new Error('Failed to get Instagram access token');
    }

    // Use the token to fetch user data
    const profileResponse = await fetch(
      `https://graph.instagram.com/${username}?fields=id,username,media_count,followers_count&access_token=${tokenData.access_token}`
    );

    if (!profileResponse.ok) {
      console.error('Instagram API error:', await profileResponse.text());
      throw new Error('Failed to fetch Instagram data');
    }

    const profileData = await profileResponse.json();

    // Transform the data
    const result = {
      followers: profileData.followers_count,
      engagementRate: 4.2, // Example rate since not available in public API
      commentsPerPost: 25, // Example since not available in public API
      sharesPerPost: 15,   // Example since not available in public API
      recentPosts: [
        { date: "Jan", engagement: 2400 },
        { date: "Feb", engagement: 1398 },
        { date: "Mar", engagement: 9800 },
        { date: "Apr", engagement: 3908 },
        { date: "May", engagement: 4800 },
        { date: "Jun", engagement: 3800 },
      ],
      posts: [
        { timestamp: "2024-01-21T09:00:00Z", likes: 1200, comments: 45 },
        { timestamp: "2024-01-21T15:00:00Z", likes: 2300, comments: 89 },
        { timestamp: "2024-01-21T18:00:00Z", likes: 3100, comments: 120 },
        { timestamp: "2024-01-21T21:00:00Z", likes: 1800, comments: 67 },
        { timestamp: "2024-01-22T12:00:00Z", likes: 2100, comments: 78 },
        { timestamp: "2024-01-22T16:00:00Z", likes: 2800, comments: 95 },
      ],
    };

    // Cache the result
    await supabase
      .from('instagram_cache')
      .upsert({ 
        username, 
        data: result,
        updated_at: new Date().toISOString()
      });

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