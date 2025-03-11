
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon, AlertTriangle } from "lucide-react";
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
        <div className="p-4 border border-amber-300 bg-amber-50 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm font-medium text-amber-700">Image generation temporarily disabled</p>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Image generation has been temporarily disabled to prevent additional costs. Please check back later.
          </p>
        </div>

        <div>
          <Label htmlFor="prompt" className="text-sm font-medium">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Feature temporarily disabled"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none min-h-[100px] mt-1 focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={true}
          />
        </div>

        <div>
          <Label htmlFor="negative-prompt" className="text-sm font-medium">Negative Prompt (Optional)</Label>
          <Input
            id="negative-prompt"
            placeholder="Feature temporarily disabled"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="mt-1 focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={true}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={true}
        className="w-full mt-4 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-400 hover:to-gray-500 transition-all duration-300"
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Feature Disabled
      </Button>
    </form>
  );
};
