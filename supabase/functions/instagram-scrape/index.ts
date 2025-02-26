
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Processing request for Instagram profile:', username);

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first
    const { data: cachedData } = await supabase
      .from('instagram_cache')
      .select('*')
      .eq('username', username)
      .single();

    if (cachedData && 
        (new Date().getTime() - new Date(cachedData.updated_at).getTime()) / 1000 < CACHE_DURATION) {
      console.log('Returning cached data for:', username);
      return new Response(
        JSON.stringify(cachedData.data),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch data from RapidAPI
    const rapidApiKey = Deno.env.get('RAPID_API_KEY');
    if (!rapidApiKey) {
      throw new Error('RapidAPI key is not configured');
    }

    console.log('Fetching data from RapidAPI for:', username);
    
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'instagram-scraper-2022.p.rapidapi.com'
      }
    };

    const response = await fetch(`https://instagram-scraper-2022.p.rapidapi.com/ig/info_username/?user=${username}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI error:', response.status, errorText);
      throw new Error(`RapidAPI request failed: ${response.status} ${errorText}`);
    }

    const rawData = await response.json();
    
    // Transform the raw API data into our format
    const processedData = processInstagramData(rawData);

    // Cache the processed data
    await supabase
      .from('instagram_cache')
      .upsert({ 
        username, 
        data: processedData,
        updated_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify(processedData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in instagram-scrape function:', error);
    
    // If API is down or any error occurs, return mock data
    console.log('Error occurred, returning mock data');
    const mockData = generateMockData();
    
    return new Response(
      JSON.stringify({ 
        data: mockData,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 200, // Return 200 with mock data and error message
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Process and transform the raw data from RapidAPI
function processInstagramData(rawData: any) {
  try {
    const userData = rawData.data?.user || {};
    
    return {
      followers: userData.edge_followed_by?.count || 0,
      following: userData.edge_follow?.count || 0,
      posts: userData.edge_owner_to_timeline_media?.count || 0,
      engagementRate: calculateEngagementRate(userData),
      username: userData.username || '',
      fullName: userData.full_name || '',
      biography: userData.biography || '',
      profilePicture: userData.profile_pic_url_hd || userData.profile_pic_url || '',
      isPrivate: userData.is_private || false,
      isVerified: userData.is_verified || false,
      recentPosts: processRecentPosts(userData.edge_owner_to_timeline_media?.edges || []),
      metrics: {
        avgLikes: calculateAverageLikes(userData.edge_owner_to_timeline_media?.edges || []),
        avgComments: calculateAverageComments(userData.edge_owner_to_timeline_media?.edges || [])
      }
    };
  } catch (error) {
    console.error('Error processing Instagram data:', error);
    return generateMockData();
  }
}

// Calculate engagement rate based on followers and recent post interactions
function calculateEngagementRate(userData: any) {
  try {
    const followers = userData.edge_followed_by?.count || 0;
    if (followers === 0) return 0;
    
    const posts = userData.edge_owner_to_timeline_media?.edges || [];
    if (posts.length === 0) return 0;
    
    let totalEngagement = 0;
    posts.slice(0, Math.min(10, posts.length)).forEach((post: any) => {
      const likes = post.node?.edge_liked_by?.count || post.node?.edge_media_preview_like?.count || 0;
      const comments = post.node?.edge_media_to_comment?.count || 0;
      totalEngagement += likes + comments;
    });
    
    const avgEngagementPerPost = totalEngagement / posts.length;
    const engagementRate = (avgEngagementPerPost / followers) * 100;
    
    return Number(engagementRate.toFixed(2));
  } catch (error) {
    console.error('Error calculating engagement rate:', error);
    return 0;
  }
}

// Calculate average likes across recent posts
function calculateAverageLikes(posts: any[]) {
  try {
    if (posts.length === 0) return 0;
    
    const totalLikes = posts.reduce((sum, post) => {
      const likes = post.node?.edge_liked_by?.count || post.node?.edge_media_preview_like?.count || 0;
      return sum + likes;
    }, 0);
    
    return Math.floor(totalLikes / posts.length);
  } catch (error) {
    console.error('Error calculating average likes:', error);
    return 0;
  }
}

// Calculate average comments across recent posts
function calculateAverageComments(posts: any[]) {
  try {
    if (posts.length === 0) return 0;
    
    const totalComments = posts.reduce((sum, post) => {
      const comments = post.node?.edge_media_to_comment?.count || 0;
      return sum + comments;
    }, 0);
    
    return Math.floor(totalComments / posts.length);
  } catch (error) {
    console.error('Error calculating average comments:', error);
    return 0;
  }
}

// Process recent posts to our format
function processRecentPosts(posts: any[]) {
  try {
    return posts.slice(0, Math.min(6, posts.length)).map((post: any) => {
      const node = post.node || {};
      return {
        timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
        shortcode: node.shortcode || '',
        likes: node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
        comments: node.edge_media_to_comment?.count || 0,
        caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        thumbnail: node.thumbnail_src || node.display_url || ''
      };
    });
  } catch (error) {
    console.error('Error processing recent posts:', error);
    return [];
  }
}

// Generate mock data for fallback
function generateMockData() {
  return {
    followers: Math.floor(Math.random() * 100000) + 10000,
    following: Math.floor(Math.random() * 5000) + 500,
    posts: Math.floor(Math.random() * 1000) + 100,
    engagementRate: Number((Math.random() * 5 + 1).toFixed(2)),
    username: 'instagram_user',
    fullName: 'Instagram User',
    biography: 'This is mock data generated when the API is unavailable.',
    profilePicture: 'https://via.placeholder.com/150',
    isPrivate: false,
    isVerified: Math.random() > 0.5,
    recentPosts: Array.from({ length: 6 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      shortcode: `mockpost${i}`,
      likes: Math.floor(Math.random() * 5000) + 1000,
      comments: Math.floor(Math.random() * 100) + 20,
      caption: `This is mock post #${i + 1}`,
      thumbnail: `https://via.placeholder.com/300?text=Post+${i + 1}`
    })),
    metrics: {
      avgLikes: Math.floor(Math.random() * 3000) + 1000,
      avgComments: Math.floor(Math.random() * 100) + 20
    }
  };
}
