
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
  
  try {
    // For the Cristina model, switch to using the proper integration method
    if (name === "cristina-generator") {
      return await runCristinaPrediction(replicate, prompt, negativePrompt);
    }
    
    // Standard deployment prediction if not Cristina
    const prediction = await replicate.deployments.predictions.create(
      owner,
      name,
      {
        input: {
          prompt: prompt,
          negative_prompt: negativePrompt || undefined
        }
      }
    );
    
    console.log("Deployment prediction started");
    
    // Just return the prediction ID and status immediately
    // The frontend will poll for updates
    return {
      id: prediction.id,
      status: prediction.status,
      url: prediction.urls?.get,
      created_at: prediction.created_at
    };
  } catch (error) {
    console.error("Error starting deployment prediction:", error);
    throw error;
  }
}

// Special handler for Cristina model
export async function runCristinaPrediction(replicate: any, prompt: string, negativePrompt?: string) {
  console.log("Using Cristina model integration");
  
  try {
    const input = {
      prompt: `A photorealistic image of a stunning woman with brown hair: ${prompt}`,
      negative_prompt: negativePrompt || ""
    };
    
    const prediction = await replicate.run("jrogbaaa/cristina", input);
    
    console.log("Cristina model prediction direct run completed:", prediction);
    
    // Since this is a direct run, we already have the output
    return {
      output: prediction
    };
  } catch (error) {
    console.error("Error with Cristina direct run:", error);
    throw error;
  }
}

// Run model-based prediction
export async function runModelPrediction(replicate: any, modelId: string, params: any) {
  console.log(`Trying model: ${modelId} with params:`, params);
  
  try {
    // Create a prediction without waiting - removed hardware parameter as it's not supported
    const prediction = await replicate.predictions.create({
      version: modelId,
      input: params
    });
    
    console.log("Model prediction started");
    
    // Return the prediction details for polling
    return {
      id: prediction.id,
      status: prediction.status,
      url: prediction.urls?.get,
      created_at: prediction.created_at
    };
  } catch (error) {
    console.error(`Error with model ${modelId}:`, error);
    throw error;
  }
}
