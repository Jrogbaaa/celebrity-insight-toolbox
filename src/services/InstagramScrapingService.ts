import { supabase } from "@/integrations/supabase/client";

export const scrapeInstagramProfile = async (username: string) => {
  try {
    console.log('Fetching Instagram profile data for:', username);
    
    const { data, error } = await supabase.functions.invoke('instagram-scrape', {
      body: { username }
    });

    if (error) {
      console.error('Error from edge function:', error);
      if (error.message.includes('Rate limit reached')) {
        throw new Error('We have reached our API limit. Please try again in a few minutes.');
      }
      throw error;
    }

    // Check if we're getting cached data
    if (data._cached) {
      console.log('Using cached data from:', data._cacheDate);
    }

    return data;
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};