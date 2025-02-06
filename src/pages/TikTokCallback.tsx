
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TikTokCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      
      if (error) {
        console.error('TikTok auth error:', error);
        toast({
          title: "Connection Failed",
          description: "TikTok connection was refused. Please try again.",
          variant: "destructive",
        });
        navigate("/analytics");
        return;
      }

      if (!code) {
        const errorMsg = "No authorization code received from TikTok";
        console.error(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        navigate("/analytics");
        return;
      }

      try {
        const { error: functionError } = await supabase.functions.invoke("tiktok-auth", {
          body: { code },
        });

        if (functionError) {
          throw functionError;
        }

        console.log('TikTok connection successful');
        toast({
          title: "Success",
          description: "TikTok account connected successfully",
        });
      } catch (error) {
        console.error("Error connecting TikTok:", error);
        setError(error.message);
      }

      navigate("/analytics");
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-destructive">Connection Failed</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Connecting TikTok...</h1>
        <p className="text-muted-foreground">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default TikTokCallback;
