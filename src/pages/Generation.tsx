
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";
import { PostAnalyzer } from "@/components/analytics/PostAnalyzer";

const Generation = () => {
  return (
    <div className="container max-w-7xl py-2">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
        <div className="space-y-6">
          <PostAnalyzer />
          <div className="h-[calc(100vh-12rem)]">
            <ChatContainer />
          </div>
        </div>
        <div className="h-[calc(100vh-6rem)] max-h-[800px]">
          <ImageGenerator />
        </div>
      </div>
    </div>
  );
};

export default Generation;
