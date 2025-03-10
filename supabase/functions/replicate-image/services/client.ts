
import Replicate from "https://esm.sh/replicate@0.25.2"

// Initialize Replicate client
export function getReplicateClient() {
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY');
    
  if (!REPLICATE_API_TOKEN) {
    console.error('Missing Replicate API key. Please set REPLICATE_API_TOKEN or REPLICATE_API_KEY');
    throw new Error("Missing Replicate API key. Please configure it in Supabase.");
  }

  // Validate API token format
  if (!REPLICATE_API_TOKEN.startsWith('r8_') && !REPLICATE_API_TOKEN.startsWith('re_')) {
    console.error('Invalid Replicate API key format. Should start with r8_ or re_');
    throw new Error("Invalid Replicate API key format. Please check your API key.");
  }

  return new Replicate({
    auth: REPLICATE_API_TOKEN,
  });
}
