import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthRedirect = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !isAuthChecking) {
        navigate("/auth");
        toast({
          title: "Authentication required",
          description: "Please log in to access this feature",
          variant: "destructive",
        });
      }
      setIsAuthChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
        toast({
          title: "Authentication required",
          description: "Please log in to access this feature",
          variant: "destructive",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, isAuthChecking]);

  return { isAuthChecking };
};