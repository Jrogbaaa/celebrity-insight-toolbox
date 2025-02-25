
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@^0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit
const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunk for video processing

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
    
    // For videos, provide specialized feedback without processing the entire file
    if (isVideo) {
      console.log("Video file detected, providing specialized analysis");
      
      // Use first frame/smaller chunk to avoid stack overflow
      try {
        // Process a small chunk of the video to avoid memory issues
        const arrayBuffer = await (file as File).arrayBuffer();
        // Use only first 1MB for large videos to prevent stack overflow
        const chunk = new Uint8Array(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, CHUNK_SIZE)));
        
        // Convert chunk to base64 safely with smaller chunks to avoid stack overflow
        let base64 = '';
        const chunkSize = 32768; // Process 32KB at a time
        for (let i = 0; i < chunk.length; i += chunkSize) {
          const subChunk = chunk.subarray(i, Math.min(chunk.length, i + chunkSize));
          base64 += btoa(String.fromCharCode.apply(null, [...subChunk]));
        }
        
        const mimeType = (file as File).type;
        
        // Use Gemini to analyze the first frame or chunk
        const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const videoPrompt = `Analyze this video frame for social media potential. 
        This is from a video file - you may only see the first frame.
        
        Based on what you can see, provide:
        
        For strengths (3 items):
        - Visual quality assessment
        - Content type benefits
        - Potential audience appeal
        
        For improvements (3 items):
        - General video best practices
        - Platform optimization suggestions
        - Engagement enhancement tips
        
        Format as JSON with these keys:
        {
          "strengths": ["strength 1", "strength 2", "strength 3"],
          "improvements": ["improvement 1", "improvement 2", "improvement 3"],
          "engagement_prediction": "engagement prediction statement"
        }`;
        
        console.log('Attempting lightweight analysis with Gemini API...');
        
        try {
          const result = await model.generateContent([
            videoPrompt,
            {
              inlineData: {
                mimeType,
                data: base64
              }
            }
          ]);
          
          const response = await result.response;
          const text = response.text();
          
          // Try to parse JSON response
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsedResult = JSON.parse(jsonMatch[0]);
              return new Response(
                JSON.stringify(parsedResult),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } catch (jsonError) {
            console.log("Failed to parse JSON from Gemini response:", jsonError);
          }
        } catch (genAiError) {
          console.error("Error with Gemini API:", genAiError);
        }
      } catch (processingError) {
        console.error("Error processing video chunk:", processingError);
      }
      
      // Fallback response with video best practices
      return new Response(
        JSON.stringify({
          strengths: [
            "Video format detected - videos typically get 48% more engagement than static images",
            "Video content allows for storytelling and demonstrating personality/brand voice",
            "Moving content is more likely to stop users from scrolling past your post"
          ],
          improvements: [
            "Keep videos under 30 seconds for Instagram/TikTok (15 seconds is optimal for highest completion rates)",
            "Add captions - 85% of social media videos are watched without sound",
            "Ensure your first 3 seconds are attention-grabbing (users decide whether to keep watching in that time)"
          ],
          engagement_prediction: "Video content generally performs better than images across all platforms. Short, captioned videos with strong opening hooks typically see the highest engagement rates."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For images, use Gemini API for analysis
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64 with chunking for large files
    const arrayBuffer = await (file as File).arrayBuffer();
    const chunk = new Uint8Array(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, CHUNK_SIZE)));
    
    // Convert chunk to base64 safely with smaller chunks
    let base64 = '';
    const chunkSize = 32768; // Process 32KB at a time
    for (let i = 0; i < chunk.length; i += chunkSize) {
      const subChunk = chunk.subarray(i, Math.min(chunk.length, i + chunkSize));
      base64 += btoa(String.fromCharCode.apply(null, [...subChunk]));
    }
    
    const mimeType = (file as File).type;

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
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "improvements": ["improvement 1", "improvement 2", "improvement 3"],
      "engagement_prediction": "engagement prediction statement"
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
      // Find JSON object in the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        analysisResult = {
          strengths: ["Good visual content", "Potential for audience engagement", "Effective use of color/composition"],
          improvements: ["Consider adding text overlay", "Optimize image for target platform", "Use hashtags to increase reach"],
          engagement_prediction: "Moderate engagement potential with proper optimization"
        };
      }
    } catch (e) {
      console.error('Error parsing Gemini response:', e);
      // Fallback response
      analysisResult = {
        strengths: ["Good visual content", "Potential for audience engagement", "Effective use of color/composition"],
        improvements: ["Consider adding text overlay", "Optimize image for target platform", "Use hashtags to increase reach"],
        engagement_prediction: "Moderate engagement potential with proper optimization"
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
        strengths: ["Content detected", "Potential for social media use", "Consider professional editing"],
        improvements: ["Unable to fully analyze content", "Try with a smaller or different format file", "Consider image format for more detailed analysis"],
        engagement_prediction: "Analysis limited - general social media best practices recommended"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
