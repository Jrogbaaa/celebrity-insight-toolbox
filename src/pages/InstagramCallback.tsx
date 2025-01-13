import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const InstagramCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      
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

        const { error } = await supabase.functions.invoke("instagram-auth", {
          body: { code },
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Instagram account connected successfully",
        });
      } catch (error) {
        console.error("Error connecting Instagram:", error);
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