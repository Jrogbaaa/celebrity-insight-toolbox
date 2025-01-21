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
  posts: {
    timestamp: string;
    likes: number;
    comments: number;
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
  posts: [
    { timestamp: "2024-01-21T09:00:00Z", likes: 1200, comments: 45 },
    { timestamp: "2024-01-21T15:00:00Z", likes: 2300, comments: 89 },
    { timestamp: "2024-01-21T18:00:00Z", likes: 3100, comments: 120 },
    { timestamp: "2024-01-21T21:00:00Z", likes: 1800, comments: 67 },
    { timestamp: "2024-01-22T12:00:00Z", likes: 2100, comments: 78 },
    { timestamp: "2024-01-22T16:00:00Z", likes: 2800, comments: 95 },
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