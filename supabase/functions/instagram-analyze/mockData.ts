export const generateMockData = () => ({
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
});

export const cacheAnalyticsData = async (supabase: any, userId: string, data: any) => {
  const { error: upsertError } = await supabase
    .from('instagram_cache')
    .upsert({ 
      username: userId,
      data,
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    console.error('Error caching data:', upsertError);
  }
};