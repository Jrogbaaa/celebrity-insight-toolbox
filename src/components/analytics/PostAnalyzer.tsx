
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PostAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Here we'll add the actual post analysis logic later
      // For now, just show a toast to indicate it's working
      toast({
        title: "Analysis in progress",
        description: "Your post is being analyzed...",
      });
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Analysis Complete",
        description: "Post analysis has been completed successfully.",
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Post Analysis</CardTitle>
      </CardHeader>
      <CardContent>
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
            className="flex items-center gap-2"
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
      </CardContent>
    </Card>
  );
};
