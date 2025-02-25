
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult } from "@/types/analysis";

export const analyzeContent = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Use different endpoint based on file type
  const isVideo = file.type.startsWith('video/');
  const endpoint = isVideo ? 'video-analyze' : 'analyze-content';
  
  console.log(`Using ${endpoint} endpoint for ${isVideo ? 'video' : 'image'} analysis`);
  
  try {
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: formData,
    });

    if (error) {
      console.error(`Error analyzing content with ${endpoint}:`, error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }

    console.log("Analysis result:", data);
    return data as AnalysisResult;
  } catch (error) {
    console.error("Error in analyzeContent:", error);
    throw error;
  }
};

export const getErrorAnalysisResult = (error: unknown): AnalysisResult => {
  return {
    strengths: [
      "Video content generally receives higher engagement than images",
      "Moving content captures audience attention more effectively",
      "Videos allow for more storytelling and emotional connection"
    ],
    improvements: [
      "Keep videos under 30 seconds for optimal engagement",
      "Start with a hook in the first 3 seconds",
      "Add captions for viewers who watch without sound"
    ],
    engagement_prediction: "Analysis error occurred - applying general video best practices.",
    error: error instanceof Error ? error.message : 'Unknown error'
  };
};
