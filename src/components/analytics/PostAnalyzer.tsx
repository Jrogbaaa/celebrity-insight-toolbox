
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ThumbsUp, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type AnalysisResult = {
  strengths: string[];
  improvements: string[];
  engagement_prediction: string;
  raw_insights?: any;
  error?: string;
};

interface PostAnalyzerProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export const PostAnalyzer = ({ onAnalysisComplete }: PostAnalyzerProps) => {
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

  const analyzeContent = async (file: File): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('file', file);

    setProgressStatus("Preparing content for analysis...");
    
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
      const errorResult: AnalysisResult = {
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

  return (
    <>
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-[600px] h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Analysis Results</DialogTitle>
            <DialogDescription>
              {analysisResult?.error ? 
                "Showing general recommendations due to analysis error" : 
                "AI-powered insights for your content"}
            </DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <div className="mb-6 rounded-lg overflow-hidden bg-black/5 p-2">
              {mediaType === "image" ? (
                <img 
                  src={previewUrl} 
                  alt="Analyzed content" 
                  className="w-full h-auto rounded animate-fade-in"
                />
              ) : (
                <video 
                  src={previewUrl} 
                  controls 
                  className="w-full h-auto rounded animate-fade-in"
                />
              )}
            </div>
          )}
          
          {analysisResult?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                {analysisResult.error}. Showing general recommendations instead.
              </p>
            </div>
          )}
          
          {isLargeFile && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
              <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Large video files (over 10MB) may have limited analysis results. For best results, consider using shorter clips or compressing your video.
              </p>
            </div>
          )}
          
          {analysisResult && (
            <div className="space-y-6">
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                    <ThumbsUp className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700">{strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {analysisResult.improvements.map((improvement, index) => (
                      <li key={index} className="text-orange-700">{improvement}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-700 font-medium">
                  {analysisResult.engagement_prediction}
                </p>
              </div>
              
              {analysisResult.raw_insights?.contentLabels?.length > 0 && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                      <Info className="h-5 w-5" />
                      Detected Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {analysisResult.raw_insights.contentLabels.map((label: {description: string, confidence: number}, index: number) => (
                        <li key={index} className="text-purple-700">
                          {label.description} {label.confidence ? `(${Math.round(label.confidence * 100)}% confidence)` : ''}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />
        
        {loading && (
          <div className="absolute left-0 right-0 top-0 bg-white dark:bg-gray-900 p-2 z-10 rounded-md shadow-md border border-gray-200 dark:border-gray-700 max-w-xs mx-auto mt-16">
            <div className="flex flex-col gap-2 items-center justify-center p-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{progressStatus}</p>
              <Progress className="h-1 w-full" value={100} />
            </div>
          </div>
        )}
        
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          className="flex items-center gap-2 bg-[#D6BCFA] hover:bg-[#D6BCFA]/90 text-primary transition-all h-11"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Analyze Post
        </Button>
      </div>
    </>
  );
};
