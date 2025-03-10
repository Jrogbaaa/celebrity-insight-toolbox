
import { corsHeaders } from "../utils/cors.ts"
import { getReplicateClient } from "./client.ts"

// Process status check request
export async function checkPredictionStatus(predictionId: string) {
  const replicate = getReplicateClient();
  console.log("Checking status for prediction:", predictionId);
  const prediction = await replicate.predictions.get(predictionId);
  console.log("Status check response:", prediction);
  
  return new Response(JSON.stringify(prediction), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
