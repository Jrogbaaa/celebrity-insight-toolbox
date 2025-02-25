
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analyzeContent, getErrorAnalysisResult } from '@/services/ContentAnalysisService';
import { AnalysisResult } from '@/types/analysis';

const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

export const useContentAnalysis = (onAnalysisComplete?: (result: AnalysisResult) => void) => {
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file",
        variant: "destructive",
      });
      return;
    }

    setMediaType(isVideo ? "video" : "image");
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Check if it's a large video file
    setIsLargeFile(isVideo && file.size > MAX_VIDEO_SIZE);
    
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      toast({
        title: "Large Video File",
        description: "Videos over 20MB may take longer to analyze. Please be patient.",
        variant: "default",
      });
    }

    setLoading(true);
    try {
      if (isVideo) {
        setProgressStatus("Processing video. This may take some time for larger files...");
      } else {
        setProgressStatus("Analyzing image content...");
      }

      toast({
        title: "Analysis in progress",
        description: `Analyzing your ${isVideo ? "video" : "image"}...`,
      });

      const result = await analyzeContent(file);
      setAnalysisResult(result);
      setShowAnalysis(true);
      
      // Call the callback with the analysis results if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      toast({
        title: "Analysis Complete",
        description: "View your detailed post analysis.",
      });
      
      // Log raw insights if available for debugging
      if (result.raw_insights) {
        console.log('Raw analysis insights:', result.raw_insights);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Error",
        description: `Failed to analyze content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      // Create a basic analysis result with the error
      const errorResult = getErrorAnalysisResult(error);
      
      setAnalysisResult(errorResult);
      setShowAnalysis(true);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(errorResult);
      }
    } finally {
      setLoading(false);
      setProgressStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    loading,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    selectedFile,
    previewUrl,
    mediaType,
    progressStatus,
    isLargeFile,
    fileInputRef,
    handleFileSelect
  };
};
