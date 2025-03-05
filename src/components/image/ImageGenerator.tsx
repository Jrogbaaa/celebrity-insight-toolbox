
import { useState } from "react";
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
  const [selectedModel, setSelectedModel] = useState("flux");
  const { toast } = useToast();

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
      console.log('Sending request with prompt:', prompt, 'model:', selectedModel);
      
      // Use replicate-image for all model types
      const { data, error } = await supabase.functions.invoke('replicate-image', {
        body: { 
          prompt,
          modelType: selectedModel
        }
      });

      console.log('Response from image generation:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.output && data.output.length > 0) {
        setImageUrl(data.output[0]);
      } else {
        throw new Error('No image URL received from model');
      }
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
    <Card className="h-full flex flex-col p-4">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 space-y-4 overflow-y-auto">
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flux">Flux (Fast Generation)</SelectItem>
              <SelectItem value="jaime">Jaime Creator (Realistic People)</SelectItem>
            </SelectContent>
          </Select>
          
          <Textarea
            placeholder={`Describe the image you want to generate... ${
              selectedModel === "flux" 
                ? "(e.g., 'An abstract painting with vibrant colors')"
                : "(e.g., 'A professional photo of a woman with blonde hair in a red dress')"
            }`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 resize-none min-h-[150px]"
          />

          {loading && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4"
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
    </Card>
  );
};
