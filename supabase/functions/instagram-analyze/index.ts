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
    const { username } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    console.log('Analyzing Instagram profile:', username);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Attempting to get user with token');

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Failed to authenticate user');
    }
    
    if (!user) {
      console.error('No user found with token');
      throw new Error('User not found');
    }

    console.log('Successfully authenticated user:', user.id);

    // Get user's Instagram token
    const { data: tokenData, error: tokenError } = await supabase
      .from('instagram_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tokenError) {
      console.error('Error fetching token:', tokenError);
      throw new Error('Failed to retrieve Instagram token');
    }

    if (!tokenData?.access_token) {
      throw new Error('Please connect your Instagram account first');
    }

    console.log('Retrieved Instagram token, fetching profile data...');

    // Use the token to fetch Instagram data
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/${username}?fields=business_discovery{followers_count,media_count,media{comments_count,like_count,timestamp}}&access_token=${tokenData.access_token}`
    );

    const userData = await userResponse.json();

    if (userData.error) {
      console.error('Instagram API error:', userData.error);
      throw new Error(userData.error.message || 'Failed to fetch Instagram data');
    }

    const business_discovery = userData.business_discovery;
    if (!business_discovery) {
      throw new Error('Could not find business account with this username');
    }

    const media = business_discovery.media.data;

    // Calculate engagement metrics
    const totalLikes = media.reduce((sum: number, post: any) => sum + post.like_count, 0);
    const totalComments = media.reduce((sum: number, post: any) => sum + post.comments_count, 0);
    const engagementRate = ((totalLikes + totalComments) / (media.length * business_discovery.followers_count)) * 100;

    // Format recent posts for the chart
    const recentPosts = media.slice(0, 6).map((post: any) => ({
      date: new Date(post.timestamp).toLocaleString('default', { month: 'short' }),
      engagement: post.like_count + post.comments_count,
    }));

    // Calculate average comments and shares per post
    const commentsPerPost = Math.round(totalComments / media.length);
    const sharesPerPost = Math.round(media.reduce((sum: number, post: any) => sum + (post.shares || 0), 0) / media.length);

    const result = {
      followers: business_discovery.followers_count,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      commentsPerPost,
      sharesPerPost,
      recentPosts,
      posts: media.map((post: any) => ({
        timestamp: post.timestamp,
        likes: post.like_count,
        comments: post.comments_count,
      })),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing Instagram profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});