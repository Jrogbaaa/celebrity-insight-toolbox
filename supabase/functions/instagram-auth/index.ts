import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
    const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');
    const redirectUri = `${req.headers.get('origin')}/instagram-callback`;

    console.log('Exchanging code for access token with new Graph API...');

    // First, exchange the code for a short-lived access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
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

    // Exchange short-lived token for a long-lived token
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization')?.split(' ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Failed to get user');
    }

    // Store token in database
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