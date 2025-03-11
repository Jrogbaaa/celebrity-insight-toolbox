
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModelType } from "../models";
import { useImageGallery } from "../ImageGallery";

export const useImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bootMessage, setBootMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveImageToGallery } = useImageGallery();

  const handleGenerateImage = async (prompt: string, negativePrompt: string, selectedModel: ModelType) => {
    setError("Image generation has been completely disabled to prevent costs.");
    toast({
      title: "Image Generation Disabled",
      description: "All image generation functionality has been permanently disabled to prevent any costs.",
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
