import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

interface InstagramLoginButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const InstagramLoginButton = ({ onClick, isLoading }: InstagramLoginButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className="w-full gap-2 hover:bg-primary/90 transition-colors"
      variant="default"
      disabled={isLoading}
    >
      <Instagram className="h-5 w-5" />
      {isLoading ? "Connecting..." : "Continue with Instagram"}
    </Button>
  );
};