
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, AlertCircle, Info } from "lucide-react";
import { AnalysisResult } from '@/types/analysis';

interface AnalysisDialogProps {
  showAnalysis: boolean;
  setShowAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
  analysisResult: AnalysisResult | null;
  previewUrl: string | null;
  mediaType: "image" | "video";
  isLargeFile: boolean;
}

export const AnalysisDialog: React.FC<AnalysisDialogProps> = ({
  showAnalysis,
  setShowAnalysis,
  analysisResult,
  previewUrl,
  mediaType,
  isLargeFile
}) => {
  return (
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
        
        {analysisResult && <AnalysisResults analysisResult={analysisResult} />}
      </DialogContent>
    </Dialog>
  );
};

const AnalysisResults: React.FC<{ analysisResult: AnalysisResult }> = ({ analysisResult }) => {
  return (
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
  );
};
