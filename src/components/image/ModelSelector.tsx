
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { modelOptions, ModelType } from "./models";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <Tabs 
      defaultValue={selectedModel} 
      onValueChange={(value) => onModelChange(value as ModelType)} 
      className="w-full"
    >
      <TabsList className="w-full grid grid-cols-1 mb-1">
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
  );
};
