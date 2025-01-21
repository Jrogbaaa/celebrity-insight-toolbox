import { supabase } from "@/integrations/supabase/client";

const getAuthSession = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('Please sign in to view your Instagram analytics');
  }
  
  return session;
};

const invokeAnalyzeFunction = async (accessToken: string) => {
  console.log('Invoking Instagram analyze function');
  
  const { data, error } = await supabase.functions.invoke('instagram-analyze', {
    body: {},
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (error) {
    console.error('Error from edge function:', error);
    handleAnalyzeError(error);
  }

  return data;
};

const handleAnalyzeError = (error: any) => {
  if (error.message.includes('No authorization header') || 
      error.message.includes('Failed to get user')) {
    throw new Error('Please sign in to view your Instagram analytics');
  }
  if (error.message.includes('Please connect your Instagram account')) {
    throw new Error('Please connect your Instagram account to view analytics');
  }
  throw new Error('Failed to fetch Instagram data. Please try again later.');
};

export const scrapeInstagramProfile = async () => {
  try {
    console.log('Fetching Instagram profile data');
    const session = await getAuthSession();
    return await invokeAnalyzeFunction(session.access_token);
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};