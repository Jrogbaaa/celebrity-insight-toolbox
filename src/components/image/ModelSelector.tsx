
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { modelOptions, ModelType } from "./models";
import { AlertTriangle } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <div className="w-full">
      <div className="p-3 border border-red-300 bg-red-50 rounded-md mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-700">Image generation disabled</p>
        </div>
        <p className="text-xs text-red-600 mt-1">
          All image generation functionality has been disabled to prevent costs.
        </p>
      </div>
      
      <Tabs defaultValue={selectedModel} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-1 opacity-50 pointer-events-none">
          {modelOptions.map((option) => (
            <TabsTrigger key={option.id} value={option.id} className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500">
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
  );
};
