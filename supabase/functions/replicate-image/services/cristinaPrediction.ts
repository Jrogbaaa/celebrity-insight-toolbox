
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
