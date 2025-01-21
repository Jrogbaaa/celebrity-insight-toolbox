import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, getAuthenticatedUser, exchangeCodeForToken, getLongLivedToken } from './authUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID')!;
    const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET')!;
    const redirectUri = `${req.headers.get('origin')}/instagram-callback`;

    console.log('Exchanging code for access token with new Graph API...');

    const shortLivedToken = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri);
    const longLivedToken = await getLongLivedToken(shortLivedToken, clientSecret);

    const supabase = getSupabaseClient();
    const user = await getAuthenticatedUser(supabase, req.headers.get('authorization')!);

    const { error: insertError } = await supabase
      .from('instagram_tokens')
      .upsert({
        user_id: user.id,
        access_token: longLivedToken.access_token,
        token_type: 'Bearer',
        expires_in: longLivedToken.expires_in,
      });

    if (insertError) {
      console.error('Error storing token:', insertError);
      throw new Error('Failed to store Instagram token');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Instagram auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});