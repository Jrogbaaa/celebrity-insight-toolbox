
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@^0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit

serve(async (req) => {
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
    if ((file as File).size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 20MB limit');
    }

    const isVideo = (file as File).type.startsWith('video/');
    
    // For videos, use Google Cloud Video Intelligence API
    if (isVideo) {
      try {
        console.log("Processing video with Cloud Video Intelligence API");
        
        // Convert video to base64 for API request
        const arrayBuffer = await (file as File).arrayBuffer();
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        // Call Google Cloud Video Intelligence API
        const videoAnalysisResult = await analyzeVideoWithGCP(base64Content);
        
        // Process Video Intelligence API results
        const processedResults = processVideoAnalysisResults(videoAnalysisResult);
        
        return new Response(
          JSON.stringify(processedResults),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (videoError) {
        console.error("Error in video analysis:", videoError);
        return new Response(
          JSON.stringify({
            strengths: ["Video content detected"],
            improvements: ["We encountered an issue analyzing your video. For best results, consider shorter clips under 10MB."],
            engagement_prediction: "Unable to complete full video analysis. Consider trying with key frames or shorter clips."
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For images, use Gemini API for analysis
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64 with chunking for large files
    const arrayBuffer = await (file as File).arrayBuffer();
    const chunk = arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 5 * 1024 * 1024)); // First 5MB for large files
    const base64 = btoa(String.fromCharCode(...new Uint8Array(chunk)));
    const mimeType = file.type;

    const prompt = `Analyze this image for social media potential. 
    Consider:
    1. Visual composition and quality
    2. Engagement potential
    3. Target audience appeal
    4. Branding consistency
    5. Call-to-action effectiveness
    
    Provide specific strengths, areas for improvement, and predict engagement potential.
    Format the response as JSON with these keys:
    {
      "strengths": [],
      "improvements": [],
      "engagement_prediction": ""
    }`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64
        }
      }
    ]);

    console.log('Received response from Gemini API');
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response from the text
    let analysisResult;
    try {
      // Find JSON object in the text (it might be wrapped in other text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create structured format from the text
        const lines = text.split('\n').filter(line => line.trim());
        analysisResult = {
          strengths: [lines[0] || "Content has potential for engagement"],
          improvements: [lines[1] || "Consider optimizing for better engagement"],
          engagement_prediction: lines[2] || "Moderate engagement potential expected"
        };
      }
    } catch (e) {
      console.error('Error parsing Gemini response:', e);
      // Fallback structured response if parsing fails
      analysisResult = {
        strengths: ["Content has potential for engagement"],
        improvements: ["Consider optimizing for better engagement"],
        engagement_prediction: "Moderate engagement potential expected"
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        strengths: [],
        improvements: ["Unable to analyze content at this time"],
        engagement_prediction: "Analysis unavailable"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Function to analyze video using Google Cloud Video Intelligence API
async function analyzeVideoWithGCP(base64Content: string) {
  const gcpApiKey = Deno.env.get('GCP_API_KEY') || '';
  if (!gcpApiKey) {
    throw new Error('GCP API key not configured');
  }

  const requestBody = {
    inputContent: base64Content,
    features: ["LABEL_DETECTION", "SHOT_CHANGE_DETECTION"],
    locationId: "us-east1",
    videoContext: {
      labelDetectionConfig: {
        frameConfidenceThreshold: 0.4,
        labelDetectionMode: "SHOT_MODE"
      }
    }
  };

  const response = await fetch(
    `https://videointelligence.googleapis.com/v1/videos:annotate?key=${gcpApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GCP Video API error:', errorText);
    throw new Error(`Failed to analyze video: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('GCP Video API operation:', data.name);

  // Poll for operation completion
  return await pollOperation(data.name, gcpApiKey);
}

// Poll the operation until it's complete
async function pollOperation(operationName: string, apiKey: string) {
  const maxAttempts = 10;
  const delayMs = 3000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(
      `https://videointelligence.googleapis.com/v1/${operationName}?key=${apiKey}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Poll attempt ${attempt + 1} failed:`, errorText);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      continue;
    }
    
    const operationData = await response.json();
    
    if (operationData.done) {
      console.log('Video analysis operation complete');
      return operationData;
    }
    
    console.log(`Operation in progress (attempt ${attempt + 1}/${maxAttempts}), waiting ${delayMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error('Video analysis operation timed out');
}

// Process Video Intelligence API results into our expected format
function processVideoAnalysisResults(videoResults: any) {
  try {
    const strengths = [];
    const improvements = [];
    let confidence = 0;
    let totalLabels = 0;
    
    // Extract label annotations
    const annotationResults = videoResults?.response?.annotationResults?.[0];
    const labelAnnotations = annotationResults?.segmentLabelAnnotations || [];
    
    // Sort labels by confidence
    const sortedLabels = [...labelAnnotations].sort((a, b) => {
      const confA = a.segments?.[0]?.confidence || 0;
      const confB = b.segments?.[0]?.confidence || 0;
      return confB - confA;
    });
    
    // Process top labels (strengths)
    const topLabels = sortedLabels.slice(0, 5);
    topLabels.forEach(label => {
      const description = label.entity?.description;
      const labelConfidence = label.segments?.[0]?.confidence || 0;
      
      if (description && labelConfidence > 0.6) {
        strengths.push(`Strong presence of "${description}" content that viewers can easily identify`);
      }
      
      confidence += labelConfidence;
      totalLabels++;
    });
    
    // Add more general strengths if we have limited label insights
    if (strengths.length < 3) {
      strengths.push("Video has clear visual elements that can be recognized by viewers");
      if (annotationResults?.shotAnnotations && annotationResults.shotAnnotations.length > 1) {
        strengths.push("Multiple scene transitions create visual interest and keep viewers engaged");
      }
    }
    
    // Add improvements based on analysis
    if (totalLabels < 3) {
      improvements.push("Consider adding more easily recognizable content or subjects");
    }
    
    if (sortedLabels.length > 10) {
      improvements.push("Video contains many different elements which may distract viewers - consider simplifying visual content");
    }
    
    improvements.push("Add text overlays or captions to reinforce key messages");
    improvements.push("Consider shorter clips focusing on the highest-performing visual elements");
    
    // Calculate average confidence for engagement prediction
    const avgConfidence = totalLabels > 0 ? confidence / totalLabels : 0;
    let engagement_prediction = "";
    
    if (avgConfidence > 0.8) {
      engagement_prediction = "High engagement potential. Video contains clearly recognizable content that should resonate well with viewers.";
    } else if (avgConfidence > 0.6) {
      engagement_prediction = "Moderate engagement potential. Video has recognizable elements but could benefit from more visual clarity.";
    } else {
      engagement_prediction = "Limited engagement potential. Consider simplifying content and focusing on more recognizable elements.";
    }
    
    return {
      strengths: strengths.length > 0 ? strengths : ["Video has potential for engagement"],
      improvements: improvements.length > 0 ? improvements : ["Consider optimizing for better visual clarity"],
      engagement_prediction
    };
  } catch (error) {
    console.error("Error processing video analysis results:", error);
    return {
      strengths: ["Video content detected"],
      improvements: ["For optimal analysis, consider clearer visual elements and shorter clips"],
      engagement_prediction: "Unable to accurately predict engagement based on available data"
    };
  }
}
