import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageGenerationForm } from "./ImageGenerationForm";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { ModelType } from "./models";
import { useImageGallery } from "./ImageGallery";

export const ImageGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const { toast } = useToast();
  const { saveImageToGallery } = useImageGallery();

  const cleanupPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const pollPredictionStatus = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('replicate-image', {
        body: { predictionId: id }
      });

      if (error) {
        throw new Error(`Error checking status: ${error.message}`);
      }

      console.log('Prediction status:', data);

      if (data.status === 'succeeded' && data.output) {
        cleanupPolling();
        setLoading(false);
        
        const image = Array.isArray(data.output) ? data.output[0] : data.output;
        setImageUrl(image);
        setPredictionId(null);
        
        toast({
          title: "Image Generated",
          description: "Your image has been successfully generated",
        });
      } else if (data.status === 'failed' || data.status === 'canceled') {
        cleanupPolling();
        setLoading(false);
        setPredictionId(null);
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      console.error('Error polling prediction status:', error);
      cleanupPolling();
      setLoading(false);
      setPredictionId(null);
      setError(error instanceof Error ? error.message : "Failed to check generation status");
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    }
  };

  const handleGenerateImage = async (prompt: string, negativePrompt: string, selectedModel: ModelType) => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setImageUrl(null);
    setError(null);
    setPredictionId(null);
    cleanupPolling();

    try {
      console.log('Sending request with prompt:', prompt, 'model:', selectedModel);
      
      const { data, error } = await supabase.functions.invoke('replicate-image', {
        body: { 
          prompt,
          negativePrompt: negativePrompt,
          modelType: selectedModel
        }
      });

      console.log('Response from image generation:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (data?.output) {
        const image = Array.isArray(data.output) ? data.output[0] : data.output;
        setImageUrl(image);
        setLoading(false);
        
        toast({
          title: "Image Generated",
          description: `Successfully generated image with ${selectedModel} model`,
        });
      } 
      else if (data?.prediction?.id) {
        setPredictionId(data.prediction.id);
        
        const interval = setInterval(() => {
          pollPredictionStatus(data.prediction.id);
        }, 2000);
        
        setPollingInterval(interval as unknown as number);
        
        toast({
          title: "Generation Started",
          description: "Your image is being generated. This may take up to 30 seconds.",
        });
      } 
      else if (data?.error) {
        throw new Error(data.error);
      } 
      else {
        throw new Error('No image data or prediction ID received');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      
      toast({
        title: "Image Generation Failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to generate image. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSaveToGallery = () => {
    if (imageUrl) {
      saveImageToGallery(imageUrl);
      toast({
        title: "Success",
        description: "Image saved to gallery",
      });
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <Card className="h-full flex flex-col p-4 shadow-md border-secondary/20 hover-scale glass-card bg-gradient-to-br from-white to-muted/30">
      <ImageGenerationForm 
        onSubmit={handleGenerateImage}
        loading={loading}
      />
      
      {error && (
        <div className="mt-4 p-4 rounded-md bg-destructive/10 border border-destructive">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 text-xs text-primary underline hover:text-primary/80"
          >
            Try again
          </button>
        </div>
      )}
      
      <ImagePreviewDialog 
        imageUrl={imageUrl}
        onClose={() => setImageUrl(null)}
        onSaveToGallery={handleSaveToGallery}
      />
    </Card>
  );
};
