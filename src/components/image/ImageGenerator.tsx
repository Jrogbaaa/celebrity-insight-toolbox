
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
    try {
      const { data, error } = await supabase.functions.invoke('gemini-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.response) {
        setImageUrl(data.response);
        toast({
          title: "Success",
          description: "Image generated successfully!",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe the image you want to generate... (e.g., 'A professional Instagram photo of a coffee shop with warm lighting and modern decor')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-32 resize-none"
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

      {imageUrl && (
        <div className="mt-4">
          <img 
            src={imageUrl} 
            alt="Generated content"
            className="w-full rounded-lg shadow-lg" 
          />
        </div>
      )}
    </Card>
  );
};
