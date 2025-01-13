import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const { toast } = useToast();

  const handleInstagramConnect = async () => {
    try {
      // Get the client ID from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-instagram-client-id');
      
      if (error) throw error;
      
      const clientId = data.clientId;
      if (!clientId) {
        throw new Error("Instagram client ID not configured");
      }

      const redirectUri = `${window.location.origin}/instagram-callback`;
      const scope = 'user_profile,user_media';
      
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Instagram connection error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate Instagram connection",
        variant: "destructive",
      });
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
          >
            <Instagram className="mr-2 h-4 w-4" />
            Connect Instagram
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