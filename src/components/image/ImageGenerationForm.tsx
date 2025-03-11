
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, AlertTriangle } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { ModelType } from "./models";

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
    // Disabled - no submission allowed
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
          <ImageIcon className="h-5 w-5 text-secondary" />
          Image Generator <span className="text-xs text-red-600 ml-2">(Disabled)</span>
        </h2>
        
        <ModelSelector 
          selectedModel={selectedModel} 
          onModelChange={setSelectedModel} 
        />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <div>
          <Label htmlFor="prompt" className="text-sm font-medium text-gray-500">Prompt (Disabled)</Label>
          <Textarea
            id="prompt"
            placeholder="Feature completely disabled to prevent costs"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none min-h-[100px] mt-1 bg-gray-100 text-gray-400"
            disabled={true}
          />
        </div>

        <div>
          <Label htmlFor="negative-prompt" className="text-sm font-medium text-gray-500">Negative Prompt (Disabled)</Label>
          <Input
            id="negative-prompt"
            placeholder="Feature completely disabled to prevent costs"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="mt-1 bg-gray-100 text-gray-400"
            disabled={true}
          />
        </div>
      </div>

      <Button 
        type="button" 
        disabled={true}
        className="w-full mt-4 bg-gray-300 hover:bg-gray-300 text-gray-600 cursor-not-allowed"
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Image Generation Disabled
      </Button>
    </form>
  );
};
