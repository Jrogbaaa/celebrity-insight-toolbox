
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

    // Validate token format (basic check)
    if (!REPLICATE_API_TOKEN.startsWith('r8_')) {
      console.error('Invalid Replicate API key format. Should start with r8_');
      return new Response(
        JSON.stringify({ 
          error: "Invalid Replicate API key format. Please check your key." 
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
      // Use the Cristina model
      output = await replicate.run(
        "stability-ai/stable-diffusion-xl-base-1.0", // Fallback to a reliable model
        {
          input: {
            prompt: body.prompt,
            negative_prompt: body.negativePrompt || "",
            width: 768,
            height: 768,
            num_outputs: 1,
            scheduler: "K_EULER_ANCESTRAL",
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        }
      );
    } else if (body.modelType === "jaime") {
      output = await replicate.run(
        "stability-ai/stable-diffusion-xl-base-1.0", // Fallback to a reliable model
        {
          input: {
            prompt: body.prompt,
            width: 768,
            height: 768,
            num_outputs: 1,
            scheduler: "K_EULER_ANCESTRAL",
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        }
      );
    } else {
      // Default to flux model
      output = await replicate.run(
        "stability-ai/sdxl-turbo", // Using a reliable fast model as backup
        {
          input: {
            prompt: body.prompt,
            num_inference_steps: 1,
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
