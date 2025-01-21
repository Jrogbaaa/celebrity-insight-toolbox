import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const getInstagramToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: tokens } = await supabase
    .from('instagram_tokens')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return tokens?.access_token;
};

export const analyzeInstagramProfile = async (username: string) => {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Authentication required");
  }

  console.log("Analyzing profile with auth token:", session.access_token);
  
  const { data, error } = await supabase.functions.invoke('instagram-analyze', {
    body: { username },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    }
  });

  if (error) {
    console.error("Error analyzing profile:", error);
    throw error;
  }
  return data;
};

export const useInstagramAnalysis = (username: string) => {
  return useQuery({
    queryKey: ['instagram-analysis', username],
    queryFn: () => analyzeInstagramProfile(username),
    enabled: !!username,
  });
};