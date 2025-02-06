
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTikTokAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTikTokLogin = async () => {
    setIsLoading(true);
    try {
      const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
      if (!clientKey) {
        throw new Error("TikTok client key not configured");
      }

      const redirectUri = `${window.location.origin}/tiktok-callback`;
      const scope = "user.info.basic,video.list";
      const responseType = "code";
      const authUrl = `https://www.tiktok.com/auth/authorize?client_key=${clientKey}&response_type=${responseType}&scope=${scope}&redirect_uri=${redirectUri}`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error("TikTok auth error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to TikTok. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleTikTokLogin,
  };
};
