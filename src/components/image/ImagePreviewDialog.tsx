
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePreviewDialog = ({ imageUrl, onClose }: ImagePreviewDialogProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!imageUrl} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] w-auto h-auto max-h-[90vh] p-1 overflow-hidden bg-transparent border-0">
        {imageUrl && (
          <div className="relative group animate-fade-in">
            <Button
              onClick={onClose}
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDownload}
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <img 
              src={imageUrl} 
              alt="Generated content"
              className="w-full h-full object-contain rounded-lg shadow-xl" 
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
