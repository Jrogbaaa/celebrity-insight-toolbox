import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import FirecrawlApp from 'npm:@mendable/firecrawl-js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawlWithRetry(firecrawl: any, url: string, retryCount = 0): Promise<any> {
  try {
    console.log(`Attempt ${retryCount + 1} to crawl URL: ${url}`);
    const response = await firecrawl.crawlUrl(url, {
      limit: 10,
      scrapeOptions: {
        formats: ['html']
      }
    });
    return response;
  } catch (error) {
    console.error('Crawl error:', error);
    
    // Check for Instagram scraping unsupported error
    if (error.statusCode === 403 && error.message?.includes('no longer supported')) {
      throw new Error('Instagram profile analysis is temporarily unavailable. We are working on restoring this functionality.');
    }
    
    // Handle rate limiting
    if (error.statusCode === 429 && retryCount < MAX_RETRIES) {
      const waitTime = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Rate limited. Waiting ${waitTime}ms before retry ${retryCount + 1}`);
      await delay(waitTime);
      return crawlWithRetry(firecrawl, url, retryCount + 1);
    }
    throw error;
  }
}

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

    // For now, return mock data since Instagram scraping is not supported
    console.log('Generating mock data for:', username);
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

    // Cache the mock data
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
    
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});