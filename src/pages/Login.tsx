import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { InstagramFeatureList } from "@/components/instagram/InstagramFeatureList";

const Login = () => {
  const { isLoading, handleInstagramLogin } = useInstagramAuth();

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <Instagram className="mx-auto h-12 w-12 mb-4 text-pink-500" />
          <h1 className="text-2xl font-bold mb-4">Welcome to Instagram Analytics</h1>
          <p className="text-muted-foreground mb-6">
            Connect your Instagram Business account to:
          </p>
          <InstagramFeatureList />
          <Button 
            onClick={handleInstagramLogin}
            className="w-full gap-2 hover:bg-primary/90 transition-colors"
            variant="default"
            disabled={isLoading}
          >
            <Instagram className="h-5 w-5" />
            {isLoading ? "Connecting..." : "Continue with Instagram"}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            This app is categorized under Social Networks & Dating and Messaging on Meta
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;