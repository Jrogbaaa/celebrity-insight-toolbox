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

// This is mock data simulating public Instagram metrics
const MOCK_DATA: SocialMetrics = {
  followers: 15400,
  engagementRate: 4.2,
  commentsPerPost: 25,
  sharesPerPost: 15,
  recentPosts: [
    { date: "Jan", engagement: 2400 },
    { date: "Feb", engagement: 1398 },
    { date: "Mar", engagement: 9800 },
    { date: "Apr", engagement: 3908 },
    { date: "May", engagement: 4800 },
    { date: "Jun", engagement: 3800 },
  ],
};

export const useSocialMediaMetrics = () => {
  return useQuery({
    queryKey: ["social-metrics"],
    queryFn: async (): Promise<SocialMetrics> => {
      // In a real implementation, this would fetch public data
      // For now using mock data
      return MOCK_DATA;
    },
  });
};