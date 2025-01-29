import { useQuery } from "@tanstack/react-query";
import { scrapeInstagramProfile } from "./InstagramScrapingService";

export const analyzeInstagramProfile = async () => {
  try {
    const data = await scrapeInstagramProfile();
    return data;
  } catch (error) {
    console.error("Error analyzing profile:", error);
    throw error;
  }
};

export const useInstagramAnalysis = () => {
  return useQuery({
    queryKey: ['instagram-analysis'],
    queryFn: () => analyzeInstagramProfile(),
  });
};