
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
    // Standard deployment prediction
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

// Updated implementation for Cristina model with correct parameter structure
export async function runCristinaPrediction(replicate: any, prompt: string, negativePrompt?: string) {
  console.log("Using Cristina model with correct parameter structure");
  
  try {
    // Use the run() method which handles the whole prediction lifecycle
    // with correctly structured input parameters
    const output = await replicate.run(
      "jrogbaaa/cristina",
      {
        input: {
          // The model specifically requires 'text' parameter, not 'prompt'
          text: `A photorealistic image of a stunning woman with brown hair: ${prompt}`
        }
      }
    );
    
    console.log("Cristina generation completed:", output);
    
    // For successful direct run, format response like other predictions for consistency
    return {
      id: "direct-run", // Not a real ID since we're using run() which is synchronous
      status: "succeeded",
      output: output,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error with Cristina direct run:", error);
    
    // If direct run failed, try the async predictions API as fallback
    console.log("Trying async predictions API as fallback");
    try {
      // First try to get the latest version of the model
      const model = await replicate.models.get("jrogbaaa/cristina");
      const latestVersion = model.latest_version;
      
      console.log("Latest version ID:", latestVersion.id);
      
      // Create the prediction with correctly structured input
      const prediction = await replicate.predictions.create({
        version: latestVersion.id, // Use actual version ID instead of model name
        input: {
          // The model specifically requires 'text' parameter, not 'prompt'
          text: `A photorealistic image of a stunning woman with brown hair: ${prompt}`
        }
      });
      
      console.log("Cristina prediction started:", prediction);
      
      // Return prediction details for polling
      return {
        id: prediction.id,
        status: prediction.status,
        url: prediction.urls?.get,
        created_at: prediction.created_at
      };
    } catch (secondError) {
      console.error("Error with fallback method:", secondError);
      throw secondError; // Throw the latest error
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
