
import { corsHeaders } from "../utils/cors.ts";
import { MODEL_CONFIGS } from "../config/models.ts";
import { isCacheValid, getCachedResult, cacheResult } from "../utils/cache.ts";
import { 
  getReplicateClient, 
  checkPredictionStatus, 
  runDeploymentPrediction, 
  runModelPrediction,
  runCristinaPrediction
} from "../services/replicateService.ts";

// Process image generation request
export async function handleRequest(req: Request) {
  const body = await req.json();

  // If it's a status check request
  if (body.predictionId) {
    return await checkPredictionStatus(body.predictionId);
  }

  // For generation requests
  return await handleGenerationRequest(body);
}

// Main function to handle image generation
async function handleGenerationRequest(body: any) {
  if (!body.prompt) {
    return new Response(
      JSON.stringify({ 
        error: "Missing required field: prompt is required" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  const modelType = body.modelType || "flux";
  const prompt = body.prompt;
  const negativePrompt = body.negativePrompt || "";
  
  // Check cache first
  const cacheKey = `${modelType}-${prompt}-${negativePrompt}`;
  if (isCacheValid(cacheKey)) {
    console.log("Returning cached result for:", cacheKey);
    const cachedResult = getCachedResult(cacheKey);
    return new Response(JSON.stringify({ output: cachedResult.output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  console.log("Generating image with prompt:", prompt, "model type:", modelType);
  
  // Get model configuration
  const modelConfig = MODEL_CONFIGS[modelType];
  if (!modelConfig) {
    return new Response(
      JSON.stringify({ 
        error: `Unknown model type: ${modelType}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  // Initialize the Replicate client
  const replicate = getReplicateClient();
  
  // Direct handling for Cristina model with the new integration
  if (modelType === "cristina") {
    try {
      console.log("Using direct Cristina integration");
      const result = await runCristinaPrediction(replicate, prompt, negativePrompt);
      
      // Cache the result
      cacheResult(cacheKey, result);
      
      return new Response(JSON.stringify({ output: result.output }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      console.error("Error with Cristina integration:", error);
      throw error;
    }
  }
  
  let prediction = null;
  let lastError = null;

  // Try deployment if configured
  if (modelConfig.deployment) {
    try {
      const deploymentConfig = modelConfig.deployment;
      let deploymentPrompt = prompt;
      
      // Apply prompt templates based on model type
      if (modelType === "jaime") {
        deploymentPrompt = `A photorealistic image of a handsome man with dark hair: ${prompt}`;
      }
      
      prediction = await runDeploymentPrediction(
        replicate, 
        deploymentConfig.owner, 
        deploymentConfig.name, 
        deploymentPrompt, 
        negativePrompt
      );
      
    } catch (error) {
      console.error(`Error with deployment ${modelConfig.deployment.owner}/${modelConfig.deployment.name}:`, error);
      lastError = error;
    }
  }

  // If deployment didn't work or isn't used, try regular models
  if (!prediction && modelConfig.models) {
    // Try each model in order until one succeeds
    for (const model of modelConfig.models) {
      try {
        const params = { ...model.params };
        
        // Apply prompt templates based on model type
        if (modelType === "jaime") {
          params.prompt = `A photorealistic image of a handsome man with dark hair: ${prompt}`;
        } else {
          params.prompt = prompt;
        }
        
        if (negativePrompt) {
          params.negative_prompt = negativePrompt;
        }
        
        prediction = await runModelPrediction(replicate, model.id, params);
        if (prediction) break;
      } catch (error) {
        console.error(`Error with model ${model.id}:`, error);
        lastError = error;
        // Continue to next model
      }
    }
  }

  if (!prediction && lastError) {
    throw lastError;
  }

  if (!prediction) {
    throw new Error("All models failed to generate an image");
  }

  console.log("Generation initiated:", prediction);
  return new Response(JSON.stringify({ 
    prediction: prediction,
    status: "processing" 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}
