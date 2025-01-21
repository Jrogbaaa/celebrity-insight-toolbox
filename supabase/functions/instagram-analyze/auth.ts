import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
};

export const getAuthenticatedUser = async (supabase: any, authHeader: string | null) => {
  if (!authHeader) {
    console.error('No authorization header provided');
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    console.error('Failed to get user:', userError);
    throw new Error('Failed to get user');
  }

  return user;
};

export const getInstagramToken = async (supabase: any, userId: string) => {
  const { data: tokenData, error: tokenError } = await supabase
    .from('instagram_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (tokenError) {
    console.error('Error fetching token:', tokenError);
    throw new Error('Failed to fetch Instagram token');
  }

  if (!tokenData) {
    throw new Error('Please connect your Instagram account first');
  }

  return tokenData;
};