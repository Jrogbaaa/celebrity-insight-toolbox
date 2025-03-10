
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, Download, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ModelType = "flux" | "jaime" | "cristina";

interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
  icon: JSX.Element;
}

const modelOptions: ModelOption[] = [
  {
    id: "flux",
    name: "Flux",
    description: "Fast image generation with Flux model",
    icon: <Sparkles className="h-4 w-4 text-amber-500" />
  },
  {
    id: "jaime",
    name: "Jaime",
    description: "Generate images of Jaime",
    icon: <ImageIcon className="h-4 w-4 text-pink-500" />
  },
  {
    id: "cristina", 
    name: "Cristina",
    description: "Generate images of Cristina",
    icon: <ImageIcon className="h-4 w-4 text-violet-500" />
  }
];

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("flux");
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
      
      // Call the replicate-image function
      const { data, error } = await supabase.functions.invoke('replicate-image', {
        body: { 
          prompt,
          negativePrompt: selectedModel === "cristina" ? negativePrompt : undefined,
          modelType: selectedModel
        }
      });

      console.log('Response from image generation:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.output) {
        // Handle different output formats
        const image = Array.isArray(data.output) ? data.output[0] : data.output;
        setImageUrl(image);
      } else {
        throw new Error('No image data received from model');
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
    <Card className="h-full flex flex-col p-4 shadow-md border-secondary/20 hover-scale glass-card bg-gradient-to-br from-white to-muted/30">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
            <ImageIcon className="h-5 w-5 text-secondary" />
            Image Generator
          </h2>
          
          <Tabs defaultValue="flux" onValueChange={(value) => setSelectedModel(value as ModelType)} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-1">
              {modelOptions.map((option) => (
                <TabsTrigger key={option.id} value={option.id} className="flex items-center gap-1.5 text-xs md:text-sm">
                  {option.icon}
                  {option.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {modelOptions.map((option) => (
              <TabsContent key={option.id} value={option.id} className="mt-2">
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div>
            <Label htmlFor="prompt" className="text-sm font-medium">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate... (e.g., 'A sunset over mountains with a lake')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-none min-h-[100px] mt-1 focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>

          {selectedModel === "cristina" && (
            <div>
              <Label htmlFor="negative-prompt" className="text-sm font-medium">Negative Prompt (Optional)</Label>
              <Input
                id="negative-prompt"
                placeholder="Elements to avoid in the image (e.g., 'blurry, low quality')"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="mt-1 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg animate-pulse bg-muted/30">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                <p className="text-sm text-muted-foreground">Generating your image...</p>
              </div>
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating with {modelOptions.find(m => m.id === selectedModel)?.name}...
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
        <DialogContent className="max-w-[90vw] w-auto h-auto max-h-[90vh] p-1 overflow-hidden bg-transparent border-0">
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
