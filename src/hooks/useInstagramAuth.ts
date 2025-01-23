import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const useInstagramAuth = () => {
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
        
        if (!response.ok) {
          throw new Error('Failed to fetch client ID');
        }

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

  const handleInstagramLogin = () => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "Instagram login is not properly configured. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const redirectUri = encodeURIComponent(`${window.location.origin}/instagram-callback`);
      const scope = encodeURIComponent('instagram_basic,instagram_content_publish,instagram_graph_user_profile,instagram_graph_user_media,instagram_manage_insights');
      
      const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      
      console.log('Redirecting to Instagram OAuth URL:', instagramUrl);
      window.location.href = instagramUrl;
    } catch (error) {
      console.error("Error during Instagram redirect:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to redirect to Instagram. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    handleInstagramLogin
  };
};