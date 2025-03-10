
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the API token from environment variables
    // Replicate renamed their token to start with r8_ instead of re_
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

    console.log("Generating image with prompt:", body.prompt, "model type:", body.modelType)
    
    let output;
    if (body.modelType === "cristina") {
      // Use SDXL model for consistent results
      output = await replicate.run(
        "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        {
          input: {
            prompt: `A photorealistic image of a stunning woman with brown hair: ${body.prompt}`,
            negative_prompt: body.negativePrompt || "blurry, bad quality, deformed, ugly",
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
      );
    } else if (body.modelType === "jaime") {
      // Use SDXL model for consistent results
      output = await replicate.run(
        "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        {
          input: {
            prompt: `A photorealistic image of a handsome man with dark hair: ${body.prompt}`,
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
      );
    } else {
      // Default to fast SDXL turbo model
      output = await replicate.run(
        "stability-ai/sdxl-turbo:1773ff4189b0c6b892c638faa559a2ce3d10923d58aa63e31178b6113ecabd44",
        {
          input: {
            prompt: body.prompt,
            num_inference_steps: 4,
            guidance_scale: 0.0
          }
        }
      );
    }

    console.log("Generation response:", output)
    return new Response(JSON.stringify({ output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in replicate function:", error)
    // Add more detailed error information in the response
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      // Include request/response details if they exist
      request: error.request ? {
        url: error.request.url,
        method: error.request.method,
        headers: Object.fromEntries(error.request.headers.entries())
      } : undefined,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
      } : undefined
    };
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: errorDetails
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
