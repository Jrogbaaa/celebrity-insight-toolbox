import { useQuery } from "@tanstack/react-query";

// Store token in memory for demo purposes
let instagramToken: string | null = null;

export const setInstagramToken = (token: string) => {
  instagramToken = token;
  // Optional: Store in localStorage if you want to persist between page reloads
  localStorage.setItem('instagram_token', token);
};

export const getInstagramToken = () => {
  // Try to get from memory first, then localStorage
  return instagramToken || localStorage.getItem('instagram_token');
};

export const useInstagramMetrics = () => {
  return useQuery({
    queryKey: ["instagram-metrics"],
    queryFn: async () => {
      const token = getInstagramToken();
      if (!token) {
        throw new Error("Instagram token not configured");
      }

      // TODO: Implement actual Instagram API calls here
      // For now, return mock data
      console.log("Would fetch Instagram data with token:", token);
      
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
    enabled: !!getInstagramToken(),
  });
};
