
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Model definitions with fallbacks
const MODEL_CONFIGS = {
  flux: {
    models: [
      {
        id: "stability-ai/sdxl-turbo:1773ff4189b0c6b892c638faa559a2ce3d10923d58aa63e31178b6113ecabd44",
        params: {
          prompt: "", // Will be filled from request
          num_inference_steps: 4,
          guidance_scale: 0.0
        }
      },
      {
        id: "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f365ad97b2276af3d58ac4368e3a35a4e88e1f6f",
        params: {
          prompt: "", // Will be filled from request
          width: 768,
          height: 768,
        }
      }
    ]
  },
  jaime: {
    models: [
      {
        id: "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        params: {
          prompt: "", // Will be filled with template
          width: 768,
          height: 768,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8,
        }
      }
    ]
  },
  cristina: {
    // Using deployment instead of direct model
    deployment: {
      owner: "jrogbaaa",
      name: "cristina-generator",
    }
  }
};

// Cache for recent results to reduce API calls
const resultCache = new Map();
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

// Check if cache entry is valid
function isCacheValid(cacheKey) {
  if (!resultCache.has(cacheKey)) return false;
  const entry = resultCache.get(cacheKey);
  return (Date.now() - entry.timestamp) < CACHE_EXPIRY;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the API token from environment variables
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY');
    
    if (!REPLICATE_API_TOKEN) {
      console.error('Missing Replicate API key. Please set REPLICATE_API_TOKEN or REPLICATE_API_KEY');
      return new Response(
        JSON.stringify({ 
          error: "Missing Replicate API key. Please configure it in Supabase." 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Validate API token format
    if (!REPLICATE_API_TOKEN.startsWith('r8_') && !REPLICATE_API_TOKEN.startsWith('re_')) {
      console.error('Invalid Replicate API key format. Should start with r8_ or re_');
      return new Response(
        JSON.stringify({ 
          error: "Invalid Replicate API key format. Please check your API key." 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Create a new Replicate client with the proper authentication
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    const body = await req.json()

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId)
      const prediction = await replicate.predictions.get(body.predictionId)
      console.log("Status check response:", prediction)
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If it's a generation request
    if (!body.prompt) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: prompt is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const modelType = body.modelType || "flux";
    const prompt = body.prompt;
    const negativePrompt = body.negativePrompt || "";
    
    // Check cache first
    const cacheKey = `${modelType}-${prompt}-${negativePrompt}`;
    if (isCacheValid(cacheKey)) {
      console.log("Returning cached result for:", cacheKey);
      const cachedResult = resultCache.get(cacheKey);
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

    let output = null;
    let lastError = null;

    // Special handling for Cristina deployment
    if (modelType === "cristina" && modelConfig.deployment) {
      try {
        console.log(`Using deployment: ${modelConfig.deployment.owner}/${modelConfig.deployment.name}`);
        
        // Create a prediction with the deployment
        let prediction = await replicate.deployments.predictions.create(
          modelConfig.deployment.owner,
          modelConfig.deployment.name,
          {
            input: {
              prompt: `A photorealistic image of a stunning woman with brown hair: ${prompt}`,
              negative_prompt: negativePrompt || undefined
            }
          }
        );
        
        // Wait for the prediction to complete
        console.log("Waiting for deployment prediction to complete...");
        prediction = await replicate.wait(prediction);
        console.log("Deployment prediction completed:", prediction);
        
        if (prediction.output) {
          output = prediction.output;
          // Store in cache
          resultCache.set(cacheKey, {
            output,
            timestamp: Date.now()
          });
        } else if (prediction.error) {
          throw new Error(prediction.error);
        }
      } catch (error) {
        console.error(`Error with deployment ${modelConfig.deployment.owner}/${modelConfig.deployment.name}:`, error);
        lastError = error;
        // Fall back to regular models if available
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

          console.log(`Trying model: ${model.id} with params:`, params);
          
          output = await replicate.run(model.id, { input: params });
          
          if (output) {
            console.log(`Success with model: ${model.id}`);
            // Store in cache
            resultCache.set(cacheKey, {
              output,
              timestamp: Date.now()
            });
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
  } catch (error) {
    console.error("Error in replicate function:", error);
    
    // Add more detailed error information in the response
    const errorDetails = {
      message: error.message || "Unknown error",
      name: error.name || "Error",
      // Include request/response details if they exist
      request: error.request ? {
        url: error.request.url,
        method: error.request.method,
        headers: Object.fromEntries(error.request.headers?.entries() || [])
      } : undefined,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        body: await error.response.text().catch(() => "Could not read response body")
      } : undefined
    };
    
    let userMessage = "Failed to generate image.";
    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      userMessage = "Authentication failed with Replicate. Please check your API key in Supabase settings.";
    } else if (error.message?.includes("model") && error.message?.includes("not found")) {
      userMessage = "The selected model is currently unavailable. Please try another model.";
    } else if (error.message?.includes("rate limit")) {
      userMessage = "Rate limit exceeded. Please try again later.";
    }
    
    return new Response(JSON.stringify({ 
      error: userMessage,
      details: errorDetails
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
