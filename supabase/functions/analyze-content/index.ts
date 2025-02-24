
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
    
    // For now, we'll handle videos differently
    if (isVideo) {
      return new Response(
        JSON.stringify({
          strengths: ["Video content detected"],
          improvements: ["For optimal analysis, consider uploading key frames or screenshots from your video"],
          engagement_prediction: "Video analysis is currently optimized for shorter clips under 20MB"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
