import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import FirecrawlApp from 'npm:@mendable/firecrawl-js';
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

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key configuration missing' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const firecrawl = new FirecrawlApp({ apiKey });
    
    console.log(`Starting crawl for Instagram profile: ${username}`);
    const response = await firecrawl.crawlUrl(`https://www.instagram.com/${username}/`, {
      limit: 10,
      scrapeOptions: {
        formats: ['html']
      }
    });

    console.log('Crawl response:', response);
    
    // For now, return mock data while we refine the selectors
    const mockData = {
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

    // Cache the data
    await supabase
      .from('instagram_cache')
      .upsert({ 
        username, 
        data: mockData,
        updated_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify(mockData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in instagram-scrape function:', error);
    
    // Check if it's a rate limit error
    if (error.message?.includes('Rate limit exceeded')) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit reached. Please try again in a minute.',
          retryAfter: 60 // Suggest retry after 1 minute
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});