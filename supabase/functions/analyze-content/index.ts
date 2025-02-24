
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@^0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64
    const arrayBuffer = await (file as File).arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = file.type;

    const prompt = `Analyze this ${file.type.startsWith('video/') ? 'video' : 'image'} for social media potential. 
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64
        }
      }
    ]);

    console.log('Gemini API Response:', result);

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
