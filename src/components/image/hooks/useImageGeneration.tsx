
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModelType } from "../models";
import { useImageGallery } from "../ImageGallery";

export const useImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>("Image generation has been completely disabled to prevent costs.");
  const [bootMessage, setBootMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveImageToGallery } = useImageGallery();

  // Completely disabled function that never makes API calls
  const handleGenerateImage = async (_prompt: string, _negativePrompt: string, _selectedModel: ModelType) => {
    console.log("Image generation function called but will never execute API requests");
    toast({
      title: "Image Generation Disabled",
      description: "All image generation functionality has been permanently disabled to prevent any costs.",
      variant: "destructive",
    });
    return null;
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
    console.log("Retry attempted but blocked");
    toast({
      title: "Feature Permanently Disabled",
      description: "All image generation features have been completely disabled to prevent any costs.",
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
