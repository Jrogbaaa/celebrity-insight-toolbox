
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("standard");
  const { toast } = useToast();
  const [showImage, setShowImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      console.log('Sending request to replicate-image with prompt:', prompt, 'model:', selectedModel);
      const { data, error } = await supabase.functions.invoke('replicate-image', {
        body: { 
          prompt,
          modelType: selectedModel
        }
      });

      console.log('Response from replicate-image:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data?.output) {
        console.error('No output data received:', data);
        throw new Error('No image data received');
      }

      const imageData = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!imageData) {
        console.error('No image URL in output:', data.output);
        throw new Error('No image URL received');
      }

      setImageUrl(imageData);
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.webp`;
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
    <>
      <Card className="p-4 max-w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Image Generator</SelectItem>
                <SelectItem value="jaime">Jaime Lorente Generator</SelectItem>
              </SelectContent>
            </Select>
            
            <Textarea
              placeholder={`First select a model, then describe the image you want to generate... ${
                selectedModel === "jaime" 
                  ? "(e.g., 'A portrait of Jaime in a modern suit')"
                  : "(e.g., 'A professional Instagram photo of a coffee shop with warm lighting and modern decor')"
              }`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-24 resize-none w-full"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </form>

        {loading && (
          <div className="mt-4 flex items-center justify-center p-8 border-2 border-dashed rounded-lg animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Card>

      <Dialog open={!!imageUrl} onOpenChange={() => setImageUrl(null)}>
        <DialogContent className="max-w-[90vw] w-auto h-auto max-h-[90vh] p-0 overflow-hidden bg-transparent border-0">
          {imageUrl && (
            <div className="relative group animate-fade-in">
              <Button
                onClick={() => setImageUrl(null)}
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
    </>
  );
};
