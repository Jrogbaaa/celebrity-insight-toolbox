
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get Social Blade API key from environment
const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestData {
  username: string;
  platform: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Handle POST request
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Check if API key is set
    if (!RAPID_API_KEY) {
      console.error("RAPID_API_KEY is not set");
      return new Response(JSON.stringify({ 
        error: "Social Blade API key is not configured", 
        details: "You need to set a RapidAPI key, not a Social Blade client ID. Please sign up on RapidAPI and subscribe to the Social Blade API."
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Get request data
    const requestData: RequestData = await req.json();
    const { username, platform } = requestData;

    if (!username || !platform) {
      return new Response(JSON.stringify({ error: "Username and platform are required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Normalize platform name
    const normalizedPlatform = normalizePlatform(platform);
    
    if (!normalizedPlatform) {
      return new Response(JSON.stringify({ error: "Unsupported platform" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    console.log(`Fetching Social Blade data for ${username} on ${normalizedPlatform}`);
    console.log(`Using API key: ${RAPID_API_KEY ? "Set (hidden)" : "Not set"}`);
    
    // Add mock/demo data for testing purposes
    if (Deno.env.get("ENVIRONMENT") === "development" || !RAPID_API_KEY) {
      console.log("Using mock data for testing (no API key or in development mode)");
      const mockData = getMockData(username, normalizedPlatform);
      
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
    
    // Try to fetch from cache first
    const { data: cachedData } = await supabase
      .from('social_blade_cache')
      .select('*')
      .eq('username', username)
      .eq('platform', normalizedPlatform)
      .single();
    
    if (cachedData) {
      const cacheDate = new Date(cachedData.fetched_at);
      const now = new Date();
      const cacheAgeHours = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60);
      
      // If cache is less than 24 hours old, return it
      if (cacheAgeHours < 24) {
        console.log(`Returning cached data from ${cachedData.fetched_at}`);
        return new Response(JSON.stringify(cachedData.data), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // Fetch data from Social Blade API
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'social-blade.p.rapidapi.com'
      }
    };
    
    const url = `https://social-blade.p.rapidapi.com/${normalizedPlatform}/statistics?query=${username}`;
    console.log(`Fetching from URL: ${url}`);
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Social Blade API error (${response.status}): ${errorText}`);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch data from Social Blade", 
        details: `Status: ${response.status}`,
        message: errorText,
        url: url
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    const socialBladeData = await response.json();
    console.log('Social Blade API response:', JSON.stringify(socialBladeData).substring(0, 100) + '...');
    
    // Save the fetched data to Supabase for caching
    await supabase
      .from('social_blade_cache')
      .upsert({
        username,
        platform: normalizedPlatform,
        data: socialBladeData,
        fetched_at: new Date().toISOString(),
      }, { onConflict: 'username,platform' });

    return new Response(JSON.stringify(socialBladeData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in Social Blade function:", error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});

// Helper function to normalize platform names to Social Blade format
function normalizePlatform(platform: string): string | null {
  const platformMap: Record<string, string> = {
    'instagram': 'instagram',
    'youtube': 'youtube',
    'tiktok': 'tiktok',
    'facebook': 'facebook',
    'twitter': 'twitter',
    'twitch': 'twitch'
  };
  
  return platformMap[platform.toLowerCase()] || null;
}

// Function to generate mock data for testing
function getMockData(username: string, platform: string) {
  // Mock data for Instagram
  if (platform === 'instagram') {
    return {
      username: username,
      fullname: username === 'cristipedroche' ? 'Cristina Pedroche' : 'Instagram User',
      followers: 2950000,
      following: 1254,
      uploads: 1876,
      engagement_rate: 4.2,
      average_likes: 124500,
      average_comments: 3200,
      growth: {
        weekly: 12500,
        monthly: 48700,
        yearly: 547000
      },
      most_popular_posts: [
        {
          url: "https://instagram.com/p/example1",
          likes: 254000,
          comments: 5400,
          posted_date: "2023-12-15"
        },
        {
          url: "https://instagram.com/p/example2",
          likes: 212000,
          comments: 4300,
          posted_date: "2023-11-20"
        }
      ],
      estimated_earnings: {
        low: "$5,400",
        high: "$9,100",
        per_post: "$3,200"
      },
      _note: "This is mock data for testing purposes only"
    };
  }
  
  // Mock data for other platforms (generic)
  return {
    username: username,
    platform: platform,
    followers: 1250000,
    following: 850,
    engagement_rate: 3.8,
    estimated_yearly_earnings: "$45,000 - $120,000",
    _note: "This is mock data for testing purposes only"
  };
}
