
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
