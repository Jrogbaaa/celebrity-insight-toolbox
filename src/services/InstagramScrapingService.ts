const INSTAGRAM_API_BASE = 'https://graph.instagram.com/v12.0';

export const scrapeInstagramProfile = async (username: string) => {
  try {
    console.log('Fetching Instagram profile:', username);
    
    // Call our Supabase Edge Function that will use the stored credentials
    const { data, error } = await fetch(
      `${window.location.origin}/functions/v1/instagram-analyze?username=${encodeURIComponent(username)}`
    ).then(res => res.json());

    if (error) {
      throw new Error(error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};