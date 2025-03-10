
import { Sparkles, Image as ImageIcon } from "lucide-react";

export type ModelType = "flux" | "jaime" | "cristina";

export interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
  icon: JSX.Element;
}

export const modelOptions: ModelOption[] = [
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
    description: "Generate photorealistic images of Cristina using H100 GPU acceleration",
    icon: <ImageIcon className="h-4 w-4 text-violet-500" />
  }
];
