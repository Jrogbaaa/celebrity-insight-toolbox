import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Analytics = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      setIsConnecting(true);
      // Get the client ID from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-instagram-client-id');
      
      if (error) {
        console.error('Error getting client ID:', error);
        throw new Error("Failed to initialize Instagram connection");
      }
      
      const clientId = data.clientId;
      if (!clientId) {
        throw new Error("Instagram client ID not configured");
      }

      // Use window.location.origin to ensure the redirect URI matches exactly
      const redirectUri = `${window.location.origin}/instagram-callback`;
      const scope = 'user_profile,user_media';
      
      // Construct the Instagram OAuth URL with all required parameters
      const authUrl = new URL('https://api.instagram.com/oauth/authorize');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('response_type', 'code');
      
      // Log the URL for debugging
      console.log('Instagram auth URL:', authUrl.toString());
      
      // Redirect to Instagram auth page
      window.location.href = authUrl.toString();
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Data Analytics</h1>
      
      <div className="mb-8 p-4 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Connect Instagram Account</h2>
        <div className="flex gap-4 max-w-md">
          <Button 
            onClick={handleInstagramConnect}
            className="w-full"
            disabled={isConnecting}
          >
            <Instagram className="mr-2 h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect Instagram'}
          </Button>
        </div>
      </div>

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