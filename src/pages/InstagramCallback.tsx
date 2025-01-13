import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const InstagramCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      const error = new URLSearchParams(window.location.search).get("error");
      const errorReason = new URLSearchParams(window.location.search).get("error_reason");
      const errorDescription = new URLSearchParams(window.location.search).get("error_description");
      
      if (error || errorReason) {
        console.error('Instagram auth error:', { error, errorReason, errorDescription });
        toast({
          title: "Connection Failed",
          description: errorDescription || "Instagram connection was refused. Please try again.",
          variant: "destructive",
        });
        navigate("/analytics");
        return;
      }

      if (!code) {
        toast({
          title: "Error",
          description: "No authorization code received from Instagram",
          variant: "destructive",
        });
        navigate("/analytics");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        const { error: functionError } = await supabase.functions.invoke("instagram-auth", {
          body: { code },
        });

        if (functionError) throw functionError;

        toast({
          title: "Success",
          description: "Instagram account connected successfully",
        });
      } catch (error) {
        console.error("Error connecting Instagram:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message || "Failed to connect Instagram account",
          variant: "destructive",
        });
      }

      navigate("/analytics");
    };

    handleCallback();
  }, [navigate, toast]);

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
        <h1 className="text-2xl font-semibold mb-4">Connecting Instagram...</h1>
        <p className="text-muted-foreground">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default InstagramCallback;