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
    
    // Build proper input structure based on model requirements
    let input;
    if (isCristina) {
      console.log("Using Cristina-specific input structure with 'text' parameter");
      input = { 
        text: `A photorealistic image of a stunning woman with brown hair: ${prompt}` 
      };
    } else {
      console.log("Using standard input structure with 'prompt' parameter");
      input = { 
        prompt: prompt,
        negative_prompt: negativePrompt || undefined 
      };
    }
    
    console.log("Using deployment input structure:", input);
    
    // Standard deployment prediction - IMPORTANT: input must be nested under 'input' property
    const prediction = await replicate.deployments.predictions.create(
      owner,
      name,
      { input }
    );
    
    console.log("Deployment prediction started:", prediction.id);
    
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
  console.log("Using Cristina model integration");
  
  try {
    console.log("Running Cristina model with prompt:", prompt);
    const enhancedPrompt = `A photorealistic image of a stunning woman with brown hair: ${prompt}`;
    
    const output = await replicate.run(
      "jrogbaaa/cristina:132c98d22d2171c64e55fe7eb539fbeef0085cb0bd5cac3e8d005234b53ef1cb",
      {
        input: {
          text: enhancedPrompt
        }
      }
    );
    
    console.log("Cristina prediction completed:", output);
    
    return {
      id: "direct-run",
      status: "succeeded",
      output: output,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error with Cristina integration:", error);
    if (error.response) {
      console.error("Response error details:", {
        status: error.response.status,
        data: await error.response.text().catch(() => "Could not read response body")
      });
    }
    throw error;
  }
}

// Run model-based prediction
export async function runModelPrediction(replicate: any, modelId: string, params: any) {
  console.log(`Trying model: ${modelId} with params:`, params);
  
  try {
    // IMPORTANT: For the Cristina model, we need special handling
    const isCristinaModel = modelId.includes("jrogbaaa/cristina");
    
    if (isCristinaModel) {
      console.log("Using direct model for Cristina:", modelId);
      // For Cristina model, convert prompt to text parameter
      const textPrompt = `A photorealistic image of a stunning woman with brown hair: ${params.prompt}`;
      
      // Create prediction with correct structure - nest under input
      const prediction = await replicate.predictions.create({
        version: modelId,
        input: {
          text: textPrompt
        }
      });
      
      console.log("Cristina model prediction started:", prediction.id);
      return {
        id: prediction.id,
        status: prediction.status,
        url: prediction.urls?.get,
        created_at: prediction.created_at
      };
    } else {
      // For standard models, use the regular approach
      console.log("Using standard model prediction approach");
      const prediction = await replicate.predictions.create({
        version: modelId,
        input: params
      });
      
      console.log("Model prediction started:", prediction.id);
      return {
        id: prediction.id,
        status: prediction.status,
        url: prediction.urls?.get,
        created_at: prediction.created_at
      };
    }
  } catch (error) {
    console.error(`Error with model ${modelId}:`, error);
    // Enhanced error logging
    if (error.response) {
      console.error("Response error details:", {
        status: error.response.status,
        data: await error.response.text().catch(() => "Could not read response body")
      });
    }
    throw error;
  }
}
