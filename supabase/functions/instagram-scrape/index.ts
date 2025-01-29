import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Fetching Instagram data for:', username);

    const rapidApiKey = Deno.env.get('RAPID_API_KEY');
    if (!rapidApiKey) {
      throw new Error('RAPID_API_KEY is not configured');
    }

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'instagram-scraper-2022.p.rapidapi.com'
      }
    };

    // First try to get data from cache
    const { data: existingData } = await supabase
      .from('instagram_cache')
      .select('data, updated_at')
      .eq('username', username)
      .single();

    // If we have recent cached data (less than 1 hour old), return it
    if (existingData && existingData.updated_at) {
      const cacheAge = Date.now() - new Date(existingData.updated_at).getTime();
      if (cacheAge < 3600000) { // 1 hour in milliseconds
        console.log('Returning cached data for:', username);
        return new Response(
          JSON.stringify(existingData.data),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const response = await fetch(
      `https://instagram-scraper-2022.p.rapidapi.com/ig/info_username/?user=${username}`,
      options
    );

    if (response.status === 429) {
      console.error('RapidAPI rate limit reached');
      // If we have any cached data, return it even if it's old
      if (existingData) {
        console.log('Returning stale cached data due to rate limit');
        return new Response(
          JSON.stringify({
            ...existingData.data,
            _cached: true,
            _cacheDate: existingData.updated_at
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit reached. Please try again in a few minutes.',
          code: 'RATE_LIMIT'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!response.ok) {
      throw new Error(`RapidAPI request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched Instagram data');

    // Cache the new data
    const { error: cacheError } = await supabase
      .from('instagram_cache')
      .upsert({ 
        username, 
        data,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'username' 
      });

    if (cacheError) {
      console.error('Error caching data:', cacheError);
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in instagram-scrape function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});