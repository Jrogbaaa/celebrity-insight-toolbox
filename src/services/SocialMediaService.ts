import { useQuery } from "@tanstack/react-query";
import { useInstagramMetrics } from "./InstagramService";

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
  const instagram = useInstagramMetrics();

  return useQuery({
    queryKey: ["social-metrics"],
    queryFn: async (): Promise<SocialMetrics> => {
      // Combine data from different social media platforms
      // For now, just using Instagram data
      return {
        followers: instagram.data?.followers || 0,
        engagementRate: instagram.data?.engagementRate || 0,
        commentsPerPost: instagram.data?.commentsPerPost || 0,
        sharesPerPost: instagram.data?.sharesPerPost || 0,
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
    enabled: instagram.isSuccess,
  });
};