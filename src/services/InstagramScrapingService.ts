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
        waitForSelector: 'meta[name="description"]',
        elements: [
          {
            selector: 'meta[name="description"]',
            attribute: 'content',
            name: 'followers'
          },
          {
            selector: 'article',
            name: 'posts'
          },
          {
            selector: '.engagement-metrics',
            name: 'engagement'
          }
        ]
      }
    });

    if (!response.success) {
      throw new Error('Failed to scrape Instagram profile');
    }

    // Extract metrics from the scraped HTML
    const metrics = extractMetricsFromHtml(response.data);
    return metrics;
  } catch (error) {
    console.error('Error scraping Instagram profile:', error);
    throw error;
  }
};

function extractMetricsFromHtml(data: any): InstagramMetrics {
  try {
    // For now, return mock data while we refine the selectors
    return {
      followers: Math.floor(Math.random() * 100000) + 10000,
      engagementRate: Number((Math.random() * 5 + 1).toFixed(2)),
      commentsPerPost: Math.floor(Math.random() * 50) + 10,
      sharesPerPost: Math.floor(Math.random() * 30) + 5,
      recentPosts: Array.from({ length: 6 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }),
        engagement: Math.floor(Math.random() * 5000) + 1000
      })),
      posts: Array.from({ length: 6 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 2000) + 500,
        comments: Math.floor(Math.random() * 100) + 20
      }))
    };
  } catch (error) {
    console.error('Error extracting metrics:', error);
    throw new Error('Failed to extract metrics from scraped data');
  }
}