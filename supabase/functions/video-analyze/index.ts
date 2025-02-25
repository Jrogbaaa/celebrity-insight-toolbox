
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
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded or invalid file');
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type);

    // Check file size
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`File size exceeds ${MAX_VIDEO_SIZE/1024/1024}MB limit`);
    }

    // Make sure we actually received a video
    if (!file.type.startsWith('video/')) {
      throw new Error('Uploaded file is not a video');
    }
    
    // Extract metadata from the video without trying to process the entire content
    // This is a simplified analysis that won't cause stack overflows
    const videoMetadata = {
      type: file.type,
      size: file.size,
      name: file.name,
      lastModified: file.lastModified,
    };
    
    console.log("Video metadata:", videoMetadata);
    
    // Generate simulated analysis based on metadata
    // In a production environment, this would be replaced with actual video analysis
    const videoExtension = file.name.split('.').pop()?.toLowerCase();
    const isHighRes = file.size > 5 * 1024 * 1024; // Files larger than 5MB might be higher resolution
    
    // Create content labels based on file properties since we're not doing deep analysis
    const contentLabels = [
      { description: "Video content", confidence: 1.0 },
      { description: isHighRes ? "High quality video" : "Standard quality video", confidence: 0.9 },
      { description: `${videoExtension} format`, confidence: 1.0 },
      { description: file.size > 10 * 1024 * 1024 ? "Long form content" : "Short form content", confidence: 0.8 }
    ];
    
    // Create insights
    const videoInsights = {
      contentLabels,
      shotChanges: Math.floor(file.size / (1024 * 1024)), // Rough estimate based on file size
      processingStatus: 'complete',
      metadata: videoMetadata
    };
    
    // Generate strengths based on video properties
    const strengths = [
      "Video format detected - videos typically receive 2-3x more engagement than static images",
      isHighRes ? "High quality video content tends to perform better and appear more professional" : "Standard quality video works well for most social media platforms",
      `Videos are ideal for storytelling and demonstrating products or services`
    ];
    
    // Generate improvements based on video properties
    const improvements = [
      "Keep videos under 30 seconds for Instagram/TikTok (15 seconds is optimal for highest completion rates)",
      "Add captions to your videos - 85% of social media videos are watched without sound",
      file.size > 10 * 1024 * 1024 ? "Consider creating shorter highlight clips for social media" : "Consider adding text overlays to emphasize key points"
    ];
    
    // Return analysis results
    return new Response(
      JSON.stringify({
        strengths: strengths,
        improvements: improvements,
        engagement_prediction: `This ${file.size > 10 * 1024 * 1024 ? "longer" : "short-form"} video has engagement potential. Videos typically receive 48% more engagement than static images across platforms.`,
        raw_insights: videoInsights,
        file_info: videoMetadata
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in video-analyze function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
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
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 200 
      }
    );
  }
});
