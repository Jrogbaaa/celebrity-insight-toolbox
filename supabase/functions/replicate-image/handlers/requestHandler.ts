
import { corsHeaders } from "../utils/cors.ts";
import { MODEL_CONFIGS } from "../config/models.ts";
import { isCacheValid, getCachedResult, cacheResult } from "../utils/cache.ts";
import { 
  getReplicateClient, 
  checkPredictionStatus, 
  runDeploymentPrediction, 
  runModelPrediction 
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
  
  let output = null;
  let lastError = null;

  // Try deployment if configured (Cristina model)
  if (modelConfig.deployment) {
    try {
      const deploymentConfig = modelConfig.deployment;
      let deploymentPrompt = prompt;
      
      // Apply prompt templates based on model type
      if (modelType === "cristina") {
        deploymentPrompt = `A photorealistic image of a stunning woman with brown hair: ${prompt}`;
      }
      
      output = await runDeploymentPrediction(
        replicate, 
        deploymentConfig.owner, 
        deploymentConfig.name, 
        deploymentPrompt, 
        negativePrompt
      );
      
      if (output) {
        // Store in cache
        cacheResult(cacheKey, output);
      }
    } catch (error) {
      console.error(`Error with deployment ${modelConfig.deployment.owner}/${modelConfig.deployment.name}:`, error);
      lastError = error;
    }
  }

  // If deployment didn't work or isn't used, try regular models
  if (!output && modelConfig.models) {
    // Try each model in order until one succeeds
    for (const model of modelConfig.models) {
      try {
        const params = { ...model.params };
        
        // Apply prompt templates based on model type
        if (modelType === "jaime") {
          params.prompt = `A photorealistic image of a handsome man with dark hair: ${prompt}`;
        } else if (modelType === "cristina") {
          params.prompt = `A photorealistic image of a stunning woman with brown hair: ${prompt}`;
          if (negativePrompt) {
            params.negative_prompt = negativePrompt;
          }
        } else {
          params.prompt = prompt;
        }
        
        output = await runModelPrediction(replicate, model.id, params);
        
        if (output) {
          // Store in cache
          cacheResult(cacheKey, output);
          break;
        }
      } catch (error) {
        console.error(`Error with model ${model.id}:`, error);
        lastError = error;
        // Continue to next model
      }
    }
  }

  if (!output && lastError) {
    throw lastError;
  }

  if (!output) {
    throw new Error("All models failed to generate an image");
  }

  console.log("Generation response:", output);
  return new Response(JSON.stringify({ output }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}
