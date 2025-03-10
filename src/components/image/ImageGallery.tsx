
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { X, GalleryHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface GalleryImage {
  id: string;
  url: string;
  createdAt: number;
}

export const useImageGallery = () => {
  const { toast } = useToast();
  
  const loadImagesFromStorage = (): GalleryImage[] => {
    try {
      const storedImages = localStorage.getItem('imageGallery');
      return storedImages ? JSON.parse(storedImages) : [];
    } catch (error) {
      console.error('Error loading images from local storage:', error);
      return [];
    }
  };
  
  const saveImageToGallery = (imageUrl: string) => {
    try {
      const images = loadImagesFromStorage();
      const newImage: GalleryImage = {
        id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: imageUrl,
        createdAt: Date.now()
      };
      
      const updatedImages = [newImage, ...images];
      localStorage.setItem('imageGallery', JSON.stringify(updatedImages));
      return true;
    } catch (error) {
      console.error('Error saving image to gallery:', error);
      toast({
        title: "Error",
        description: "Failed to save image to gallery",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const removeImageFromGallery = (imageId: string) => {
    try {
      const images = loadImagesFromStorage();
      const updatedImages = images.filter(img => img.id !== imageId);
      localStorage.setItem('imageGallery', JSON.stringify(updatedImages));
      return true;
    } catch (error) {
      console.error('Error removing image from gallery:', error);
      toast({
        title: "Error",
        description: "Failed to remove image from gallery",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    loadImagesFromStorage,
    saveImageToGallery,
    removeImageFromGallery
  };
};

export const ImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>(() => {
    try {
      const storedImages = localStorage.getItem('imageGallery');
      return storedImages ? JSON.parse(storedImages) : [];
    } catch (error) {
      console.error('Error loading images from local storage:', error);
      return [];
    }
  });
  const { toast } = useToast();
  
  const handleRemoveImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      localStorage.setItem('imageGallery', JSON.stringify(updatedImages));
      toast({
        title: "Success",
        description: "Image removed from gallery",
      });
    } catch (error) {
      console.error('Error removing image from gallery:', error);
      toast({
        title: "Error",
        description: "Failed to remove image from gallery",
        variant: "destructive",
      });
    }
  };
  
  if (images.length === 0) {
    return (
      <Card className="h-full flex flex-col p-4 shadow-md border-secondary/20 hover-scale glass-card bg-gradient-to-br from-white to-muted/30">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <GalleryHorizontal className="h-5 w-5 text-secondary" />
            Image Gallery
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>No saved images yet. Generate and save some images to see them here.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col p-4 shadow-md border-secondary/20 hover-scale glass-card bg-gradient-to-br from-white to-muted/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <GalleryHorizontal className="h-5 w-5 text-secondary" />
          Image Gallery ({images.length})
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="relative group cursor-pointer aspect-square rounded-md overflow-hidden"
            onClick={() => setSelectedImage(image.url)}
          >
            <img 
              src={image.url} 
              alt="Gallery image" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
              <Button
                onClick={(e) => handleRemoveImage(image.id, e)}
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <ImagePreviewDialog 
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </Card>
  );
};
