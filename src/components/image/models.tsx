
import { Sparkles } from "lucide-react";

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
    description: "DISABLED - Image generation unavailable",
    icon: <Sparkles className="h-4 w-4 text-gray-500" />
  },
  {
    id: "jaime",
    name: "JaimeCreator",
    description: "DISABLED - Image generation unavailable",
    icon: <Sparkles className="h-4 w-4 text-gray-500" />
  },
  {
    id: "cristina",
    name: "Cristina",
    description: "DISABLED - Image generation unavailable",
    icon: <Sparkles className="h-4 w-4 text-gray-500" />
  }
];
