
import { Button } from "@/components/ui/button";

interface ImageGenerationErrorProps {
  error: string | null;
  onRetry: () => void;
}

export const ImageGenerationError = ({ error, onRetry }: ImageGenerationErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="mt-4 p-4 rounded-md bg-destructive/10 border border-destructive">
      <p className="text-sm text-destructive font-medium">{error}</p>
      <Button 
        onClick={onRetry}
        className="mt-2 text-xs text-primary underline hover:text-primary/80"
        variant="link"
      >
        Try again
      </Button>
    </div>
  );
};
