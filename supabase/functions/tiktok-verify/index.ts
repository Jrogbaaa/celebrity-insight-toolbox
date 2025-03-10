
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // TikTok verification file content
  const verificationContent = `tiktok-developers-site-verification=5mgPs9peZ7s4NrzCp93nzo3LwgNn9JR0`;

  return new Response(verificationContent, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/plain',
    },
  });
});
