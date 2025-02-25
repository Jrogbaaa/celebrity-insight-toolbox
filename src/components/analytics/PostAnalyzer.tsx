
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ThumbsUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type AnalysisResult = {
  strengths: string[];
  improvements: string[];
  engagement_prediction: string;
};

export const PostAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const analyzeContent = async (file: File): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('analyze-content', {
      body: formData,
    });

    if (error) {
      console.error('Error analyzing content:', error);
      throw new Error('Failed to analyze content');
    }

    return data as AnalysisResult;
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

    setLoading(true);
    try {
      toast({
        title: "Analysis in progress",
        description: `Analyzing your ${isVideo ? "video" : "image"}...`,
      });

      const result = await analyzeContent(file);
      setAnalysisResult(result);
      setShowAnalysis(true);

      toast({
        title: "Analysis Complete",
        description: "View your detailed post analysis.",
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          className="flex items-center gap-2 bg-[#D6BCFA] hover:bg-[#D6BCFA]/90 text-primary transition-all h-9 shadow-sm"
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
