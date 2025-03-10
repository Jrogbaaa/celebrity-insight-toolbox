
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
