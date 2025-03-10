
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
    // For Cristina model, we need to use text parameter instead of prompt
    const isCristina = owner === "jrogbaaa" && name === "cristina-generator";
    const input = isCristina 
      ? { text: `A photorealistic image of a stunning woman with brown hair: ${prompt}` }
      : { prompt: prompt, negative_prompt: negativePrompt || undefined };
    
    console.log("Using input structure:", input);
    
    // Standard deployment prediction
    const prediction = await replicate.deployments.predictions.create(
      owner,
      name,
      { input }
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

// Dedicated function for Cristina model
export async function runCristinaPrediction(replicate: any, prompt: string, negativePrompt?: string) {
  // First try using deployment (preferred method)
  try {
    console.log("Attempting to use Cristina deployment");
    return await runDeploymentPrediction(
      replicate, 
      "jrogbaaa", 
      "cristina-generator", 
      prompt, 
      negativePrompt
    );
  } catch (deploymentError) {
    console.error("Deployment attempt failed, trying direct model:", deploymentError);
    
    // If deployment fails, try the direct model approach
    try {
      console.log("Attempting direct model run with Cristina");
      const enhancedPrompt = `A photorealistic image of a stunning woman with brown hair: ${prompt}`;
      console.log("Using enhanced prompt:", enhancedPrompt);
      
      // Try to get model info first to ensure latest version
      const model = await replicate.models.get("jrogbaaa/cristina");
      const latestVersionId = model.latest_version.id;
      console.log("Latest Cristina version ID:", latestVersionId);
      
      // Create prediction with correct version and input format
      const prediction = await replicate.predictions.create({
        version: latestVersionId,
        input: {
          text: enhancedPrompt
        }
      });
      
      console.log("Cristina prediction started:", prediction);
      
      return {
        id: prediction.id,
        status: prediction.status,
        url: prediction.urls?.get,
        created_at: prediction.created_at
      };
    } catch (error) {
      console.error("All Cristina model approaches failed:", error);
      throw error;
    }
  }
}

// Run model-based prediction
export async function runModelPrediction(replicate: any, modelId: string, params: any) {
  console.log(`Trying model: ${modelId} with params:`, params);
  
  try {
    // Create a prediction without waiting
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
