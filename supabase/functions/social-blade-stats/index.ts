
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get Social Blade API key from environment
const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");

interface RequestData {
  username: string;
  platform: string;
}

serve(async (req: Request) => {
  try {
    // Enable CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        status: 204,
      });
    }

    // Handle POST request
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
          "Access-Control-Allow-Origin": "*",
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
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Fetch data from Social Blade API
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY || "",
        'X-RapidAPI-Host': 'social-blade.p.rapidapi.com'
      }
    };

    console.log(`Fetching Social Blade data for ${username} on ${normalizedPlatform}`);
    
    const response = await fetch(`https://social-blade.p.rapidapi.com/${normalizedPlatform}/statistics?query=${username}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Social Blade API error (${response.status}): ${errorText}`);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch data from Social Blade", 
        details: `Status: ${response.status}`,
        message: errorText
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const socialBladeData = await response.json();
    
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
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in Social Blade function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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
