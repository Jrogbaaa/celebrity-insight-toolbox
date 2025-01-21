import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleInstagramError = (error: string | null, errorReason: string | null, errorDescription: string | null) => {
  if (error || errorReason) {
    console.error('Instagram auth error:', { error, errorReason, errorDescription });
    toast({
      title: "Connection Failed",
      description: errorDescription || "Instagram connection was refused. Please try again.",
      variant: "destructive",
    });
    return true;
  }
  return false;
};

export const validateAuthCode = (code: string | null) => {
  if (!code) {
    const errorMsg = "No authorization code received from Instagram";
    console.error(errorMsg);
    toast({
      title: "Error",
      description: errorMsg,
      variant: "destructive",
    });
    return false;
  }
  return true;
};

export const exchangeCodeForToken = async (code: string) => {
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
};