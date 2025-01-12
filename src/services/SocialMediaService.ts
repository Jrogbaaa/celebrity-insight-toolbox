import { useQuery } from "@tanstack/react-query";

interface SocialMetrics {
  followers: number;
  engagementRate: number;
  commentsPerPost: number;
  sharesPerPost: number;
  recentPosts: {
    date: string;
    engagement: number;
  }[];
}

export const useSocialMediaMetrics = () => {
  return useQuery({
    queryKey: ["social-metrics"],
    queryFn: async (): Promise<SocialMetrics> => {
      // This is where we'll integrate with social media APIs
      // For now, returning mock data until API keys are configured
      return {
        followers: 45200,
        engagementRate: 4.3,
        commentsPerPost: 234,
        sharesPerPost: 156,
        recentPosts: [
          { date: "Jan", engagement: 2400 },
          { date: "Feb", engagement: 1398 },
          { date: "Mar", engagement: 9800 },
          { date: "Apr", engagement: 3908 },
          { date: "May", engagement: 4800 },
          { date: "Jun", engagement: 3800 },
        ],
      };
    },
  });
};