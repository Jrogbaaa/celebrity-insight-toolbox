
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModelType } from "../models";
import { useImageGallery } from "../ImageGallery";

export const useImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [bootMessage, setBootMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveImageToGallery } = useImageGallery();

  const cleanupPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleGenerateImage = async (prompt: string, negativePrompt: string, selectedModel: ModelType) => {
    toast({
      title: "Service Temporarily Disabled",
      description: "Image generation has been temporarily disabled to prevent additional costs.",
      variant: "destructive",
    });
    
    // Uncomment this code when you want to re-enable the functionality
    /*
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
    setBootMessage("Starting image generation...");
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
        setBootMessage(null);
        
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
      setBootMessage(null);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      
      toast({
        title: "Image Generation Failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to generate image. Please try again later.",
        variant: "destructive",
      });
    }
    */
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

  return {
    loading,
    imageUrl,
    error,
    bootMessage,
    handleGenerateImage,
    handleSaveToGallery,
    handleRetry,
    setImageUrl
  };
};
