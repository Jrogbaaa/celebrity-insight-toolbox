import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface AnalyticsData {
  content: string;
  date: string;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

interface AnalysisResult {
  giveaways: Array<{
    description: string;
    date: string;
  }>;
  events: Array<{
    name: string;
    date: string;
    description: string;
  }>;
  deals: Array<{
    description: string;
    validUntil?: string;
  }>;
  newItems: Array<{
    name: string;
    description: string;
    date: string;
  }>;
}

export const analyzeInstagramContent = async (posts: AnalyticsData[]): Promise<AnalysisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('instagram-analyze', {
      body: { posts },
    });

    if (error) {
      console.error('Error analyzing Instagram content:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze Instagram content. Please try again later.",
        variant: "destructive",
      });
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in analyzeInstagramContent:', error);
    throw error;
  }
};

export const cacheAnalysisResults = async (username: string, results: AnalysisResult) => {
  try {
    // Convert AnalysisResult to a plain object that matches Json type
    const jsonData = {
      giveaways: results.giveaways,
      events: results.events,
      deals: results.deals,
      newItems: results.newItems
    } as Json;

    const { error } = await supabase
      .from('instagram_cache')
      .upsert({
        username,
        data: jsonData,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error caching analysis results:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in cacheAnalysisResults:', error);
    throw error;
  }
};