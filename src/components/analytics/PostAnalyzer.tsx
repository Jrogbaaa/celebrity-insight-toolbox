
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ThumbsUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalysisResult = {
  strengths: string[];
  improvements: string[];
  engagement_prediction: string;
};

export const PostAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      toast({
        title: "Analysis in progress",
        description: "Your post is being analyzed...",
      });
      
      // Simulated analysis result - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult: AnalysisResult = {
        strengths: [
          "Strong visual composition with good lighting",
          "Effective use of color contrast",
          "Clear focal point that draws attention",
          "Good image quality and resolution"
        ],
        improvements: [
          "Consider adding more engaging caption text",
          "Could benefit from strategic hashtag placement",
          "Try experimenting with different angles",
          "Add a call-to-action to boost engagement"
        ],
        engagement_prediction: "This post is likely to perform 15% above your average engagement rate"
      };
      
      setAnalysisResult(mockResult);
      setShowAnalysis(true);
      
      toast({
        title: "Analysis Complete",
        description: "View your detailed post analysis.",
      });
    } catch (error) {
      console.error('Error analyzing post:', error);
      toast({
        title: "Error",
        description: "Failed to analyze post. Please try again.",
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
      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all"
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

      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post Analysis Results</DialogTitle>
          </DialogHeader>
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
    </>
  );
};
