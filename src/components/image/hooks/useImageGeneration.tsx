
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

  const handleGenerateImage = async (prompt: string, negativePrompt: string, selectedModel: ModelType) => {
    toast({
      title: "All Image Generation Disabled",
      description: "All image generation features have been completely disabled to prevent costs.",
      variant: "destructive",
    });
    return;
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
    toast({
      title: "Feature Disabled",
      description: "All image generation features have been completely disabled.",
      variant: "destructive",
    });
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
