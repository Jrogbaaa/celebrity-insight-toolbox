
import { corsHeaders } from "../utils/cors.ts"
import { getReplicateClient } from "./client.ts"
import { checkPredictionStatus } from "./statusCheck.ts"
import { runDeploymentPrediction } from "./deploymentPrediction.ts"
import { runModelPrediction } from "./modelPrediction.ts"
import { runCristinaPrediction } from "./cristinaPrediction.ts"

// Export all functions to maintain the same API
export {
  getReplicateClient,
  checkPredictionStatus,
  runDeploymentPrediction,
  runModelPrediction,
  runCristinaPrediction
}
