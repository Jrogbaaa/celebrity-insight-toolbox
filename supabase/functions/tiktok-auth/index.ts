
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');

    if (!clientKey || !clientSecret) {
      throw new Error('TikTok API credentials not configured');
    }

    if (!code) {
      throw new Error('Authorization code is required');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('TikTok token error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // Get the authenticated user from Supabase
    const supabase = getSupabaseClient();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    
    if (userError || !user) {
      throw new Error('Failed to get user');
    }

    // Store the token in our database
    const { error: tokenError } = await supabase
      .from('tiktok_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        scope: tokenData.scope,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
      });

    if (tokenError) {
      console.error('Error storing token:', tokenError);
      throw new Error('Failed to store token');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
