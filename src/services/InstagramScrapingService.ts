import { supabase } from "@/integrations/supabase/client";

interface InstagramMetrics {
  followers: number;
  engagementRate: number;
  commentsPerPost: number;
  sharesPerPost: number;
  recentPosts: {
    date: string;
    engagement: number;
  }[];
  posts: {
    timestamp: string;
    likes: number;
    comments: number;
  }[];
}

export const scrapeInstagramProfile = async (username: string): Promise<InstagramMetrics> => {
  try {
    console.log('Scraping Instagram profile:', username);
    
    const { data, error } = await supabase.functions.invoke('instagram-scrape', {
      body: { username }
    });

    if (error) {
      console.error('Error scraping Instagram profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error scraping Instagram profile:', error);
    throw error;
  }
};