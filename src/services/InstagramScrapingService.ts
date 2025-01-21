import { supabase } from "@/integrations/supabase/client";

export const scrapeInstagramProfile = async () => {
  try {
    console.log('Fetching Instagram profile data');
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Please sign in to view your Instagram analytics');
    }
    
    const { data, error } = await supabase.functions.invoke('instagram-analyze', {
      body: {},
      headers: {
        // Use the session's access token directly
        Authorization: `Bearer ${session?.access_token}`
      }
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