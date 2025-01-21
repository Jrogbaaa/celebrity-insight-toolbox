import FirecrawlApp from '@mendable/firecrawl-js';
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
    // Get Firecrawl API key from Supabase Edge Function secrets
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Authentication required");
    }

    const firecrawl = new FirecrawlApp({ 
      apiKey: process.env.FIRECRAWL_API_KEY || ''
    });

    console.log('Scraping Instagram profile:', username);
    
    const response = await firecrawl.crawlUrl(`https://www.instagram.com/${username}/`, {
      limit: 10,
      scrapeOptions: {
        formats: ['html'],
        selectors: {
          followers: '.followers-count',
          posts: '.post-item',
          engagement: '.engagement-metrics'
        }
      }
    });

    if (!response.success) {
      throw new Error('Failed to scrape Instagram profile');
    }

    // Process the scraped data
    const metrics: InstagramMetrics = {
      followers: extractFollowersCount(response.data),
      engagementRate: calculateEngagementRate(response.data),
      commentsPerPost: extractCommentsPerPost(response.data),
      sharesPerPost: extractSharesPerPost(response.data),
      recentPosts: extractRecentPosts(response.data),
      posts: extractPosts(response.data)
    };

    return metrics;
  } catch (error) {
    console.error('Error scraping Instagram profile:', error);
    throw error;
  }
};

// Helper functions to extract and process scraped data
function extractFollowersCount(data: any): number {
  // For now returning mock data until we implement proper selectors
  return Math.floor(Math.random() * 100000) + 10000;
}

function calculateEngagementRate(data: any): number {
  return Number((Math.random() * 5 + 1).toFixed(2));
}

function extractCommentsPerPost(data: any): number {
  return Math.floor(Math.random() * 50) + 10;
}

function extractSharesPerPost(data: any): number {
  return Math.floor(Math.random() * 30) + 5;
}

function extractRecentPosts(data: any): { date: string; engagement: number }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    date: month,
    engagement: Math.floor(Math.random() * 5000) + 1000
  }));
}

function extractPosts(data: any): { timestamp: string; likes: number; comments: number }[] {
  return Array.from({ length: 6 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    likes: Math.floor(Math.random() * 2000) + 500,
    comments: Math.floor(Math.random() * 100) + 20
  }));
}