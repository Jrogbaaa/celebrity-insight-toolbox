
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";
import { PostAnalyzer } from "@/components/analytics/PostAnalyzer";
import { PostingInsights } from "@/components/analytics/PostingInsights";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";

const Generation = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  // Handler to receive analytics data from the PostAnalyzer
  const handleAnalyticsResult = (data: any) => {
    setAnalyticsData(data);
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-0 md:px-4">
        <div className="px-4 md:px-0 md:-mt-10 mb-0 flex justify-end items-center">
          <div>
            <PostAnalyzer onAnalysisComplete={handleAnalyticsResult} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
          <div className="h-[calc(100vh-3rem)]">
            <ChatContainer />
          </div>
          <div className="h-[calc(100vh-3rem)] overflow-y-auto flex flex-col gap-6">
            <ImageGenerator />
            {analyticsData && (
              <PostingInsights 
                insights={{
                  posting_tips: [
                    "Based on your content analysis, post at peak engagement times for maximum visibility",
                    "Use hashtags related to the content subjects detected in your video",
                    "Create a series of related content to build on this theme and increase engagement"
                  ],
                  peak_engagement_times: ["6:00 PM - 9:00 PM", "12:00 PM - 2:00 PM"],
                  general_best_times: {
                    monday: ["7:00 AM", "8:00 PM"],
                    tuesday: ["12:00 PM", "7:00 PM"],
                    thursday: ["8:00 AM", "2:00 PM"]
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Generation;
