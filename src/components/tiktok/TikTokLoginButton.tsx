
import { Button } from "@/components/ui/button";

interface TikTokLoginButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const TikTokLoginButton = ({ onClick, isLoading }: TikTokLoginButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className="w-full gap-2 hover:bg-primary/90 transition-colors"
      variant="default"
      disabled={isLoading}
    >
      {isLoading ? "Connecting..." : "Continue with TikTok"}
    </Button>
  );
};
