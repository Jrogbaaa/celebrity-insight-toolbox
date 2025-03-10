
// Model configurations with fallbacks
export const MODEL_CONFIGS = {
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
    // Using the direct integration for Cristina model
    deployment: {
      owner: "jrogbaaa",
      name: "cristina-generator",
    }
  }
};
