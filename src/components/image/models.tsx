
import { Sparkles } from "lucide-react";

export type ModelType = "flux";

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
    description: "Disabled - Image generation temporarily unavailable",
    icon: <Sparkles className="h-4 w-4 text-amber-500" />
  }
];
