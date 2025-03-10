
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { ModelType, modelOptions } from "./models";

interface ImageGenerationFormProps {
  onSubmit: (prompt: string, negativePrompt: string, model: ModelType) => Promise<void>;
  loading: boolean;
}

export const ImageGenerationForm = ({ onSubmit, loading }: ImageGenerationFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>("flux");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(prompt, negativePrompt, selectedModel);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
          <ImageIcon className="h-5 w-5 text-secondary" />
          Image Generator
        </h2>
        
        <ModelSelector 
          selectedModel={selectedModel} 
          onModelChange={setSelectedModel} 
        />
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
  );
};
