import { supabase } from "@/integrations/supabase/client";

export const scrapeInstagramProfile = async () => {
  try {
    console.log('Fetching Instagram profile data');
    
    const { data, error } = await supabase.functions.invoke('instagram-analyze', {
      body: {}  // No need to pass username anymore
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};