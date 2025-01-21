import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INSTAGRAM_API_BASE = 'https://graph.instagram.com/v12.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    console.log('Analyzing Instagram profile:', username);

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

    // Fetch fresh data from Instagram API
    const instagramToken = Deno.env.get('INSTAGRAM_APP_TOKEN');
    const response = await fetch(
      `${INSTAGRAM_API_BASE}/${username}?fields=id,username,media_count,followers_count&access_token=${instagramToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram data');
    }

    const profileData = await response.json();

    // Transform the data
    const result = {
      followers: profileData.followers_count,
      engagementRate: 4.2, // Example rate
      commentsPerPost: 25,
      sharesPerPost: 15,
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