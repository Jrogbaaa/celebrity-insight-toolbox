
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, AlertTriangle } from "lucide-react";
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
    // Prevent submission
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
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-700">Image generation completely disabled</p>
          </div>
          <p className="text-xs text-red-600 mt-1">
            All image generation functionality has been disabled to prevent any costs. This feature is not available at this time.
          </p>
        </div>

        <div>
          <Label htmlFor="prompt" className="text-sm font-medium">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Feature disabled"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none min-h-[100px] mt-1 focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={true}
          />
        </div>

        <div>
          <Label htmlFor="negative-prompt" className="text-sm font-medium">Negative Prompt</Label>
          <Input
            id="negative-prompt"
            placeholder="Feature disabled"
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
        className="w-full mt-4 bg-gray-300 hover:bg-gray-300 text-gray-600"
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Feature Disabled
      </Button>
    </form>
  );
};
