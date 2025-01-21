import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { handleInstagramError, validateAuthCode, exchangeCodeForToken } from "@/utils/instagramAuth";

const InstagramCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      const errorReason = params.get("error_reason");
      const errorDescription = params.get("error_description");
      
      console.log('Callback parameters:', {
        code,
        error,
        errorReason,
        errorDescription,
        fullUrl: window.location.href
      });
      
      if (handleInstagramError(error, errorReason, errorDescription)) {
        navigate("/analytics");
        return;
      }

      if (!validateAuthCode(code)) {
        navigate("/analytics");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        await exchangeCodeForToken(code);
      } catch (error) {
        console.error("Error connecting Instagram:", error);
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
        <h1 className="text-2xl font-semibold mb-4">Connecting Instagram...</h1>
        <p className="text-muted-foreground">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default InstagramCallback;