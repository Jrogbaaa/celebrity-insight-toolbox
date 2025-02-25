
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";
import { PostAnalyzer } from "@/components/analytics/PostAnalyzer";
import { TooltipProvider } from "@/components/ui/tooltip";

const Generation = () => {
  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-0 md:px-4">
        <div className="px-4 md:px-0 md:-mt-10 mb-0 flex justify-end items-center">
          <div>
            <PostAnalyzer />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
          <div className="h-[calc(100vh-3rem)]">
            <ChatContainer />
          </div>
          <div className="h-[calc(100vh-3rem)]">
            <ImageGenerator />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Generation;
