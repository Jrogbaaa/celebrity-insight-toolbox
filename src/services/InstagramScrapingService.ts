
import { supabase } from "@/integrations/supabase/client";

const getAuthSession = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('Please sign in to view your Instagram analytics');
  }
  
  return session;
};

const fetchFromRapidAPI = async (username: string) => {
  try {
    console.log('Fetching Instagram data from RapidAPI for:', username);
    
    // Call our edge function to avoid exposing API key in client
    const { data, error } = await supabase.functions.invoke('instagram-scrape', {
      body: { username }
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw new Error('Failed to fetch Instagram data. Please try again later.');
    }

    return data;
  } catch (error) {
    console.error('Error fetching from RapidAPI:', error);
    throw error;
  }
};

export const scrapeInstagramProfile = async (username: string) => {
  try {
    console.log('Fetching Instagram profile data for:', username);
    
    // Check if user is authenticated
    await getAuthSession();
    
    // Fetch data from RapidAPI
    return await fetchFromRapidAPI(username);
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};
