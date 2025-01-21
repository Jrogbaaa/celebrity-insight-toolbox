import { supabase } from "@/integrations/supabase/client";

export const scrapeInstagramProfile = async () => {
  try {
    console.log('Fetching Instagram profile data');
    
    const { data, error } = await supabase.functions.invoke('instagram-analyze', {
      body: {} // No need to pass username anymore
    });

    if (error) {
      console.error('Error from edge function:', error);
      // Throw a more user-friendly error message based on the status code
      if (error.message.includes('No authorization header') || error.message.includes('Failed to get user')) {
        throw new Error('Please sign in to view your Instagram analytics');
      }
      if (error.message.includes('Please connect your Instagram account')) {
        throw new Error('Please connect your Instagram account to view analytics');
      }
      throw new Error('Failed to fetch Instagram data. Please try again later.');
    }

    return data;
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};