
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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

    let analysis;
    
    if (file.type.startsWith('image/')) {
      // Analyze image using Vision API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this image for social media potential. What are its strengths and areas for improvement?' },
                {
                  type: 'image_url',
                  image_url: {
                    url: URL.createObjectURL(file),
                  },
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      analysis = data.choices[0].message.content;
    } else if (file.type.startsWith('video/')) {
      // For video analysis, we'll use a specialized video analysis API
      // This is a placeholder - you would integrate with a video analysis service
      analysis = "Video analysis content";
    }

    // Structure the analysis results
    const analysisResult = {
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      engagement_prediction: analysis.prediction || "",
    };

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
