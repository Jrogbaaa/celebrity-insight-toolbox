
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./utils/cors.ts"
import { handleRequest } from "./handlers/requestHandler.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    return await handleRequest(req)
  } catch (error) {
    console.error("Error in replicate function:", error)
    
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
    }
    
    let userMessage = "Failed to generate image."
    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      userMessage = "Authentication failed with Replicate. Please check your API key in Supabase settings."
    } else if (error.message?.includes("model") && error.message?.includes("not found")) {
      userMessage = "The selected model is currently unavailable. Please try another model."
    } else if (error.message?.includes("rate limit")) {
      userMessage = "Rate limit exceeded. Please try again later."
    } else if (error.message?.includes("422") || error.message?.includes("Unprocessable Entity")) {
      userMessage = "The model received invalid parameters. This is likely an issue with the API integration."
    } else if (error.message?.includes("input")) {
      userMessage = "There was an issue with the input format for this model. Please try a different prompt or model."
    }
    
    return new Response(JSON.stringify({ 
      error: userMessage,
      details: errorDetails
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
