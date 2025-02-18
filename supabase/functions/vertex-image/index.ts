
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROJECT_ID = "gen-lang-client-0504403402";
const LOCATION = "us-central1";
const MODEL_ID = "imagegeneration@005";

function pemToArrayBuffer(pem: string): Uint8Array {
  try {
    console.log('Raw private key:', pem); // Log the raw private key (without sensitive data)
    
    // First, normalize the private key by handling escaped newlines
    const normalizedPem = pem
      .replace(/\\n/g, '\n')
      .replace(/["']/g, ''); // Remove any quotes

    console.log('Normalized PEM structure:', normalizedPem.substring(0, 40) + '...'); // Log the start of normalized PEM
    
    // Then extract the base64 content between the headers
    const matches = normalizedPem.match(/-----BEGIN PRIVATE KEY-----\n(.+)\n-----END PRIVATE KEY-----/s);
    if (!matches || !matches[1]) {
      console.error('PEM format validation failed');
      throw new Error('Invalid PEM format');
    }

    const base64Content = matches[1].replace(/\s/g, '');
    console.log('Base64 content length:', base64Content.length);
    
    // Decode base64 to binary
    const binary = atob(base64Content);
    console.log('Binary content length:', binary.length);
    
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    console.log('Final buffer length:', bytes.length);
    return bytes;
  } catch (error) {
    console.error('Error in pemToArrayBuffer:', error);
    throw error;
  }
}

async function getGoogleAccessToken() {
  try {
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT');
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not set');
    }

    console.log('Service account JSON length:', serviceAccountJson.length);

    const serviceAccountKey = JSON.parse(serviceAccountJson);
    console.log('Parsed service account fields:', Object.keys(serviceAccountKey));
    console.log('Service account email:', serviceAccountKey.client_email);
    
    if (!serviceAccountKey.private_key) {
      throw new Error('Private key is missing from service account');
    }

    console.log('Private key exists and starts with:', serviceAccountKey.private_key.substring(0, 27));

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

    // Convert PEM to proper binary format
    const privateKeyBuffer = pemToArrayBuffer(serviceAccountKey.private_key);
    console.log('Private key buffer length:', privateKeyBuffer.length);

    const key = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const encoder = new TextEncoder();
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token endpoint error:', errorData);
      throw new Error(`Token endpoint returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      console.error('No access token in response:', data);
      throw new Error('No access token received');
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    throw new Error(`Failed to get Google access token: ${error.message}`);
  }
}

function isValidBase64(str: string) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;
    
    const accessToken = await getGoogleAccessToken();
    console.log('Access token obtained successfully');

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
      const errorText = await response.text();
      console.error('Vertex AI Error:', errorText);
      throw new Error(`Vertex AI request failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('Vertex AI response structure:', Object.keys(result));

    if (!result?.predictions?.[0]?.bytesBase64) {
      console.error('Invalid response structure:', result);
      throw new Error('Invalid response format from Vertex AI - missing bytesBase64');
    }

    const base64Image = result.predictions[0].bytesBase64;
    
    // Validate base64 string
    if (!isValidBase64(base64Image)) {
      console.error('Invalid base64 string received');
      throw new Error('Invalid base64 string received from Vertex AI');
    }

    return new Response(
      JSON.stringify({
        predictions: [{
          bytesBase64: base64Image
        }]
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error in vertex-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  }
});
