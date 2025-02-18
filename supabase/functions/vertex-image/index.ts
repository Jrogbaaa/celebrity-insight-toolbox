
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROJECT_ID = "gen-lang-client-0504403402";
const LOCATION = "us-central1";
const MODEL_ID = "imagen-3.0-generate-002";

async function getGoogleAccessToken() {
  const serviceAccountKey = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT') || '{}');
  
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const scope = 'https://www.googleapis.com/auth/cloud-platform';
  
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const jwtClaim = {
    iss: serviceAccountKey.client_email,
    scope: scope,
    aud: tokenEndpoint,
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(serviceAccountKey.private_key), c => c.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const headerAndPayload = `${btoa(JSON.stringify(jwtHeader))}.${btoa(JSON.stringify(jwtClaim))}`;
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    encoder.encode(headerAndPayload)
  );

  const jwt = `${headerAndPayload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    const accessToken = await getGoogleAccessToken();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          negativePrompt: "blur, distortion, watermark, text, poor quality, deformed",
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Vertex AI Error:', error);
      throw new Error(`Vertex AI request failed: ${error}`);
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
