import { useQuery } from "@tanstack/react-query";
import { scrapeInstagramProfile } from "./InstagramScrapingService";

export const analyzeInstagramProfile = async (username: string) => {
  console.log("Analyzing profile:", username);
  
  try {
    const data = await scrapeInstagramProfile(username);
    return data;
  } catch (error) {
    console.error("Error analyzing profile:", error);
    throw error;
  }
};

export const useInstagramAnalysis = (username: string) => {
  return useQuery({
    queryKey: ['instagram-analysis', username],
    queryFn: () => analyzeInstagramProfile(username),
    enabled: !!username,
  });
};