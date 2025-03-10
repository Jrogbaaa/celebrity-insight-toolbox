
import Replicate from "https://esm.sh/replicate@0.25.2"
import { corsHeaders } from "../utils/cors.ts"

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

// Run deployment-based prediction
export async function runDeploymentPrediction(
  replicate: any, 
  owner: string, 
  name: string, 
  prompt: string, 
  negativePrompt?: string
) {
  console.log(`Using deployment: ${owner}/${name}`);
  
  // Create a prediction with the deployment
  let prediction = await replicate.deployments.predictions.create(
    owner,
    name,
    {
      input: {
        prompt: prompt,
        negative_prompt: negativePrompt || undefined
      }
    }
  );
  
  // Wait for the prediction to complete
  console.log("Waiting for deployment prediction to complete...");
  prediction = await replicate.wait(prediction);
  console.log("Deployment prediction completed:", prediction);
  
  if (prediction.output) {
    return prediction.output;
  } else if (prediction.error) {
    throw new Error(prediction.error);
  }
  
  return null;
}

// Run model-based prediction
export async function runModelPrediction(replicate: any, modelId: string, params: any) {
  console.log(`Trying model: ${modelId} with params:`, params);
  
  const output = await replicate.run(modelId, { input: params });
  
  if (output) {
    console.log(`Success with model: ${modelId}`);
    return output;
  }
  
  return null;
}
