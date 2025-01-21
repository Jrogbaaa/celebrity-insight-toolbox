import FirecrawlApp from '@mendable/firecrawl-js';

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
    
    const firecrawl = new FirecrawlApp({ 
      apiKey: import.meta.env.VITE_FIRECRAWL_API_KEY || ''
    });
    
    const response = await firecrawl.crawlUrl(`https://www.instagram.com/${username}/`, {
      limit: 10,
      scrapeOptions: {
        formats: ['html']
      }
    });

    if (!response.success) {
      throw new Error('Failed to scrape Instagram profile');
    }

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
    console.error('Error scraping Instagram profile:', error);
    throw error;
  }
};