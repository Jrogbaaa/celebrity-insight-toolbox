
export type AnalysisResult = {
  strengths: string[];
  improvements: string[];
  engagement_prediction: string;
  raw_insights?: {
    contentLabels?: Array<{
      description: string;
      confidence: number;
    }>;
    shotChanges?: number;
    objects?: Array<{
      name: string;
      confidence: number;
    }>;
    scenes?: Array<{
      description: string;
      confidence: number;
    }>;
    detectedText?: string[];
    speechTranscription?: string;
    apiUsed?: string;
  };
  error?: string;
};
