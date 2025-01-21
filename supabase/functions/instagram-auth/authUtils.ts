import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
};

export const getAuthenticatedUser = async (supabase: any, authHeader: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
  if (userError || !user) {
    throw new Error('Failed to get user');
  }
  return user;
};

export const exchangeCodeForToken = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) => {
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  const shortLivedToken = await tokenResponse.json();
  if (shortLivedToken.error) {
    console.error('Error getting short-lived token:', shortLivedToken);
    throw new Error(shortLivedToken.error_description || 'Failed to exchange code for token');
  }

  return shortLivedToken;
};

export const getLongLivedToken = async (shortLivedToken: any, clientSecret: string) => {
  const longLivedTokenResponse = await fetch(
    `https://graph.instagram.com/access_token?` +
    `grant_type=ig_exchange_token&` +
    `client_secret=${clientSecret}&` +
    `access_token=${shortLivedToken.access_token}`
  );

  const longLivedToken = await longLivedTokenResponse.json();
  if (longLivedToken.error) {
    console.error('Error getting long-lived token:', longLivedToken);
    throw new Error('Failed to get long-lived token');
  }

  return longLivedToken;
};