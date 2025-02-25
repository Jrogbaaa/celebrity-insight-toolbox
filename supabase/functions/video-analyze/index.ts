
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB limit

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Check file size
    if ((file as File).size > MAX_VIDEO_SIZE) {
      throw new Error('File size exceeds 20MB limit');
    }

    // Make sure we actually received a video
    if (!(file as File).type.startsWith('video/')) {
      throw new Error('Uploaded file is not a video');
    }
    
    console.log("Video file detected, size:", (file as File).size);
    
    // Get video data as base64
    const arrayBuffer = await (file as File).arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    try {
      // Get service account credentials from VIDEO_SERVICE_ACCOUNT secret
      const serviceAccountJson = Deno.env.get('VIDEO_SERVICE_ACCOUNT');
      if (!serviceAccountJson) {
        throw new Error('Video service account credentials not configured');
      }
      
      // Parse service account
      const serviceAccount = JSON.parse(serviceAccountJson);
      console.log('Using service account:', serviceAccount.client_email);
      
      // Get access token using service account
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: await generateJWT(serviceAccount)
        })
      });
      
      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        console.error('Failed to get access token:', tokenError);
        throw new Error('Authentication failed: Unable to get access token');
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      console.log('Successfully obtained access token');
      
      // Prepare the API request for Video Intelligence API
      const apiUrl = 'https://videointelligence.googleapis.com/v1/videos:annotate';
      const apiRequest = {
        inputContent: base64,
        features: ["LABEL_DETECTION", "SHOT_CHANGE_DETECTION"],
        videoContext: {
          labelDetectionConfig: {
            frameConfidenceThreshold: 0.5,
            labelDetectionMode: "SHOT_MODE"
          }
        }
      };
      
      // Make the API request
      console.log('Sending video to Cloud Video Intelligence API...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(apiRequest)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Video Intelligence API error: ${response.status} - ${errorText}`);
        throw new Error(`Video Intelligence API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Received operation name:', responseData.name);
      
      // Since this is an async operation, we'll need to poll for results
      // Wait a bit to give the API time to process
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Check operation status
      const operationUrl = `https://videointelligence.googleapis.com/v1/operations/${responseData.name}`;
      const operationResponse = await fetch(operationUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!operationResponse.ok) {
        const operationError = await operationResponse.text();
        console.error('Failed to get operation status:', operationError);
        throw new Error('Failed to check operation status');
      }
      
      const operationData = await operationResponse.json();
      console.log('Operation status:', operationData.done ? 'Complete' : 'In progress');
      
      // Extract insights from the API response
      let videoInsights;
      
      if (operationData.done && operationData.response) {
        const annotations = operationData.response.annotationResults[0];
        
        // Extract key content labels and insights
        const contentLabels = annotations?.labelAnnotations?.map(label => ({
          description: label.entity.description,
          confidence: label.segments[0]?.confidence
        })).sort((a, b) => b.confidence - a.confidence).slice(0, 10) || [];
        
        const shotChanges = annotations?.shotAnnotations?.length || 0;
        
        videoInsights = {
          contentLabels,
          shotChanges,
          processingStatus: 'complete'
        };
        
        console.log('Extracted video insights:', JSON.stringify(videoInsights));
      } else {
        // If operation not complete, provide some preliminary feedback
        videoInsights = {
          contentLabels: [],
          shotChanges: 0,
          processingStatus: 'incomplete',
          operationName: responseData.name // Include the operation name for future polling
        };
        console.log('Video analysis still in progress');
      }
      
      // Provide detailed video analysis based on insights
      const strengths = [
        "Video format detected - videos typically receive 2-3x more engagement than static images",
        ...(videoInsights.contentLabels.length > 0 
          ? [`Content featuring ${videoInsights.contentLabels.slice(0, 3).map(l => l.description).join(', ')} resonates well with audiences`] 
          : []),
        `Your video has ${videoInsights.shotChanges > 5 ? 'dynamic pacing with multiple shots' : 'a steady, focused approach'} which ${videoInsights.shotChanges > 5 ? 'helps maintain viewer attention' : 'builds viewer trust'}`
      ];
      
      const improvements = [
        "Keep videos under 30 seconds for Instagram/TikTok (15 seconds is optimal for highest completion rates)",
        ...(videoInsights.shotChanges < 3 
          ? ["Consider adding more scene transitions to improve engagement and maintain viewer interest"] 
          : (videoInsights.shotChanges > 10 
              ? ["Your video has many scene changes - consider a slightly slower pace for key messages"] 
              : [])),
        "Add captions or text overlays - 85% of social media videos are watched without sound"
      ];
      
      const subjects = videoInsights.contentLabels.length > 0 
        ? videoInsights.contentLabels.slice(0, 3).map(l => l.description).join(', ')
        : 'your subject';
        
      return new Response(
        JSON.stringify({
          strengths: strengths.slice(0, 3),
          improvements: improvements.slice(0, 3),
          engagement_prediction: `This video about ${subjects} has strong engagement potential. Videos typically receive 48% more engagement than static images across platforms.${videoInsights.processingStatus === 'incomplete' ? ' (Note: Full analysis still processing, refresh for complete results)' : ''}`,
          raw_insights: videoInsights, // Include raw insights for detailed analysis
          file_info: {
            type: (file as File).type,
            size: (file as File).size,
            name: (file as File).name
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (videoApiError) {
      console.error('Error analyzing video:', videoApiError);
      
      // Fallback to generic video analysis when API fails
      return new Response(
        JSON.stringify({
          strengths: [
            "Video format detected - videos typically receive 2-3x more engagement than static images on most platforms",
            "Motion content captures audience attention more effectively than static images, increasing retention time",
            "Video allows you to convey personality, demonstrate products/services, and tell stories more effectively"
          ],
          improvements: [
            "Keep videos under 30 seconds for Instagram/TikTok (15 seconds is optimal for highest completion rates)",
            "Ensure your first 3 seconds grab attention - users decide whether to continue watching within this timeframe",
            "Add captions or text overlays - 85% of social media videos are watched without sound"
          ],
          engagement_prediction: `This video content has engagement potential, but we couldn't perform deep analysis (API error: ${videoApiError.message}). For better results, try uploading a shorter clip.`,
          error: videoApiError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in video-analyze function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        strengths: [
          "Video content generally receives higher engagement than images",
          "Moving content captures audience attention more effectively",
          "Videos allow for more storytelling and emotional connection"
        ],
        improvements: [
          "Keep videos under 30 seconds for optimal engagement",
          "Start with a hook in the first 3 seconds",
          "Add captions for viewers who watch without sound"
        ],
        engagement_prediction: "Analysis limited - general social media video best practices recommended"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

/**
 * Generates a JWT for Google service account authentication
 */
async function generateJWT(serviceAccount) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: serviceAccount.private_key_id
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600, // 1 hour
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  };
  
  // Encode header and payload
  const encoder = new TextEncoder();
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Import private key
  const privateKey = serviceAccount.private_key;
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  
  const pemContents = privateKey.trim();
  const keyData = pemContents
    .replace(/\\n/g, "\n")
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .trim();
  
  // Convert from base64 to binary
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    false,
    ["sign"]
  );
  
  // Sign the data
  const signatureBuffer = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    cryptoKey,
    encoder.encode(signatureInput)
  );
  
  // Convert the signature to base64url
  const signature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );
  
  // Return the complete JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Encodes a string to base64url format (for JWT)
 */
function base64UrlEncode(str) {
  const base64 = btoa(str);
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
