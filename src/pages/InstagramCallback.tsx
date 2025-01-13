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
      // Get all possible error parameters from Instagram
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      const errorReason = params.get("error_reason");
      const errorDescription = params.get("error_description");
      
      // Log all parameters for debugging
      console.log('Callback parameters:', {
        code,
        error,
        errorReason,
        errorDescription,
        fullUrl: window.location.href
      });
      
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
        const errorMsg = "No authorization code received from Instagram";
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        console.log('Exchanging code for token...');
        const { error: functionError } = await supabase.functions.invoke("instagram-auth", {
          body: { code },
        });

        if (functionError) {
          console.error('Function error:', functionError);
          throw functionError;
        }

        console.log('Instagram connection successful');
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