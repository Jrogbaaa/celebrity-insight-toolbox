
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";
import { PostAnalyzer } from "@/components/analytics/PostAnalyzer";

const Generation = () => {
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4">
      <div className="px-4 md:px-0 mb-2 flex justify-end">
        <div className="w-[200px]">
          <PostAnalyzer />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
        <div className="h-[calc(100vh-8rem)]">
          <ChatContainer />
        </div>
        <div className="h-[calc(100vh-8rem)]">
          <ImageGenerator />
        </div>
      </div>
    </div>
  );
};

export default Generation;
