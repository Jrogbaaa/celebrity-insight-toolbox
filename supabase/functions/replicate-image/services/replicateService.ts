
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
    // For the Cristina model, switch to using a direct model prediction
    // instead of deployment to force hardware selection
    if (name === "cristina-generator") {
      // Hardcoded model ID for the Cristina model
      const modelId = "jrogbaaa/cristina:132c98d2db4b553d35fb39c3ee526f9753a57b040ccc4ea1dcee9305fb8fa66f";
      
      console.log(`Using direct model for Cristina: ${modelId}`);
      
      return await runModelPrediction(replicate, modelId, {
        prompt: prompt,
        negative_prompt: negativePrompt || undefined
      });
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

// Run model-based prediction
export async function runModelPrediction(replicate: any, modelId: string, params: any) {
  console.log(`Trying model: ${modelId} with params:`, params);
  
  try {
    // Create a prediction without waiting, specifying H100 hardware
    const prediction = await replicate.predictions.create({
      version: modelId,
      input: params,
      hardware: "gpu-h100" // Always use H100 GPU for model predictions
    });
    
    console.log("Model prediction started with hardware:", prediction.hardware || "default");
    
    // Return the prediction details for polling
    return {
      id: prediction.id,
      status: prediction.status,
      url: prediction.urls?.get,
      created_at: prediction.created_at,
      hardware: prediction.hardware || "default"
    };
  } catch (error) {
    console.error(`Error with model ${modelId}:`, error);
    throw error;
  }
}
