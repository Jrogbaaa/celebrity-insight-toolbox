
import { Loader2 } from "lucide-react";

interface ImageGenerationStatusProps {
  bootMessage: string | null;
  loading: boolean;
}

export const ImageGenerationStatus = ({ bootMessage, loading }: ImageGenerationStatusProps) => {
  if (!bootMessage || !loading) return null;
  
  return (
    <div className="mt-4 p-3 rounded-md bg-secondary/10 border border-secondary/20">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-secondary" />
        <p className="text-sm text-secondary-foreground">{bootMessage}</p>
      </div>
    </div>
  );
};
