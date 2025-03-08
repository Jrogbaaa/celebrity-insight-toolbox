
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
    // Check for the API token in both possible environment variables
    let REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      // Try the alternative key name
      REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_KEY');
    }
    
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN or REPLICATE_API_KEY is not set')
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
      // Use the Cristina model
      output = await replicate.run(
        "jrogbaaa/cristina",
        {
          input: {
            prompt: body.prompt,
            negative_prompt: body.negativePrompt || "",
            width: 768,
            height: 768,
            num_outputs: 1,
            scheduler: "K_EULER_ANCESTRAL",
            num_inference_steps: 20,
            guidance_scale: 5
          }
        }
      );
    } else if (body.modelType === "jaime") {
      output = await replicate.run(
        "jrogbaaa/jaimecreator:25698e8acc5ade340967890a27752f4432f0baaf10c8d58ded9e21d77ec66a09",
        {
          input: {
            prompt: body.prompt,
            model: "dev",
            go_fast: false,
            lora_scale: 1,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            guidance_scale: 3,
            output_quality: 80,
            prompt_strength: 0.8,
            extra_lora_scale: 1,
            num_inference_steps: 28
          }
        }
      );
    } else {
      // Default to flux model
      output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: body.prompt,
            go_fast: true,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 80,
            num_inference_steps: 4
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
