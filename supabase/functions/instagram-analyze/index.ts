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
    const { username } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    console.log('Analyzing Instagram profile:', username);

    // Get Instagram Graph API credentials
    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
    const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Instagram credentials not configured');
    }

    // First get the user's Instagram Business Account ID
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/${username}?fields=business_discovery{followers_count,media_count,media{comments_count,like_count,timestamp}}&access_token=${clientSecret}`
    );

    const userData = await userResponse.json();

    if (userData.error) {
      console.error('Instagram API error:', userData.error);
      throw new Error(userData.error.message);
    }

    const business_discovery = userData.business_discovery;
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