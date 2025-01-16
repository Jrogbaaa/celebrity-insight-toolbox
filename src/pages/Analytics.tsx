import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Analytics = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasInstagramToken, setHasInstagramToken] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const checkInstagramConnection = async () => {
      try {
        const { data: tokens, error } = await supabase
          .from('instagram_tokens')
          .select('access_token')
          .limit(1);
        
        if (error) {
          console.error('Error checking Instagram connection:', error);
          return;
        }
        
        setHasInstagramToken(tokens && tokens.length > 0);
      } catch (error) {
        console.error('Error checking Instagram connection:', error);
      }
    };

    checkInstagramConnection();
  }, []);

  const handleInstagramConnect = async () => {
    try {
      setIsConnecting(true);
      const { data, error } = await supabase.functions.invoke('get-instagram-client-id');
      
      if (error) {
        console.error('Error getting client ID:', error);
        toast({
          title: "Connection Error",
          description: "Failed to initialize Instagram connection. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const clientId = data?.clientId;
      if (!clientId) {
        toast({
          title: "Configuration Error",
          description: "Instagram client ID not configured. Please check your setup.",
          variant: "destructive",
        });
        return;
      }

      // Using HTTP for local development as it's more reliable
      const redirectUri = 'http://localhost:5173/instagram-callback';
      console.log('Redirect URI:', redirectUri);
      
      // Show instructions before redirecting
      setShowInstructions(true);
      
      // Store the auth URL to use after showing instructions
      window.sessionStorage.setItem('instagram_auth_url', 
        `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent([
          'instagram_basic',
          'instagram_manage_insights',
          'pages_show_list',
          'pages_read_engagement',
          'business_management'
        ].join(','))}&response_type=code&auth_type=rerequest`
      );
      
    } catch (error) {
      console.error('Instagram connection error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to Instagram. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleProceedWithAuth = () => {
    const authUrl = window.sessionStorage.getItem('instagram_auth_url');
    if (authUrl) {
      console.log('Redirecting to Instagram auth URL:', authUrl);
      window.location.href = authUrl;
    }
    setShowInstructions(false);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Data Analytics</h1>
      
      <div className="mb-8 p-4 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Connect with Instagram Business Login</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Instagram Business or Creator account to access insights and manage your content using the Instagram API.
        </p>
        <div className="flex gap-4 max-w-md">
          <Button 
            onClick={handleInstagramConnect}
            className="w-full"
            disabled={isConnecting || hasInstagramToken}
          >
            <Instagram className="mr-2 h-4 w-4" />
            {hasInstagramToken 
              ? 'Connected to Instagram' 
              : isConnecting 
                ? 'Connecting...' 
                : 'Connect Instagram'
            }
          </Button>
        </div>
      </div>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Before Connecting to Instagram</DialogTitle>
            <DialogDescription className="space-y-4 mt-4">
              <p>Please add this URL to your Facebook App's "Valid OAuth Redirect URIs":</p>
              <div className="space-y-2 mt-2">
                <code className="block bg-muted p-2 rounded-md text-xs break-all">
                  http://localhost:5173/instagram-callback
                </code>
              </div>
              <Button onClick={handleProceedWithAuth} className="w-full mt-4">
                I've Added The Redirect URI
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsGrid />
      </div>
      <div className="grid gap-4 mt-8">
        <EngagementChart />
      </div>
    </div>
  );
};

export default Analytics;