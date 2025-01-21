import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://ygweyscocelwjcqinkth.supabase.co/functions/v1/get-instagram-client-id",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        const { data, error } = await response.json();

        if (error) {
          console.error("Error fetching client ID:", error);
          toast({
            title: "Configuration Error",
            description: "Instagram login is not properly configured. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        if (!data?.clientId) {
          toast({
            title: "Configuration Error",
            description: "Instagram client ID is missing. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        console.log("Received client ID:", data.clientId);
        setClientId(data.clientId);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to initialize Instagram login. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();
  }, []);

  const handleConnectInstagram = () => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "Instagram login is not properly configured. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const redirectUri = `${window.location.origin}/instagram-callback`;
    const scope = 'instagram_basic,instagram_content_publish';
    
    const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    console.log('Redirecting to Instagram OAuth URL:', instagramUrl);
    window.location.href = instagramUrl;
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <Instagram className="mx-auto h-12 w-12 mb-4 text-pink-500" />
          <h1 className="text-2xl font-bold mb-4">Welcome to Instagram Analytics</h1>
          <p className="text-muted-foreground mb-8">
            Connect your Instagram Business account to view detailed analytics and insights about your profile.
          </p>
          <Button 
            onClick={handleConnectInstagram}
            className="w-full gap-2 hover:bg-primary/90 transition-colors"
            variant="default"
            disabled={isLoading || !clientId}
          >
            <Instagram className="h-5 w-5" />
            {isLoading ? "Connecting..." : "Continue with Instagram"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;