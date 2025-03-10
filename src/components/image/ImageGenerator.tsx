
import { Card } from "@/components/ui/card";
import { ImageGenerationForm } from "./ImageGenerationForm";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { ImageGenerationStatus } from "./ImageGenerationStatus";
import { ImageGenerationError } from "./ImageGenerationError";
import { useImageGeneration } from "./hooks/useImageGeneration";

export const ImageGenerator = () => {
  const {
    loading,
    imageUrl,
    error,
    bootMessage,
    handleGenerateImage,
    handleSaveToGallery,
    handleRetry,
    setImageUrl
  } = useImageGeneration();

  return (
    <Card className="h-full flex flex-col p-4 shadow-md border-secondary/20 hover-scale glass-card bg-gradient-to-br from-white to-muted/30">
      <ImageGenerationForm 
        onSubmit={handleGenerateImage}
        loading={loading}
      />
      
      <ImageGenerationStatus bootMessage={bootMessage} loading={loading} />
      
      <ImageGenerationError error={error} onRetry={handleRetry} />
      
      <ImagePreviewDialog 
        imageUrl={imageUrl}
        onClose={() => setImageUrl(null)}
        onSaveToGallery={handleSaveToGallery}
      />
    </Card>
  );
};
