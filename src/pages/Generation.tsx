
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";

const Generation = () => {
  return (
    <div className="container max-w-7xl py-2">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
        <div className="h-[calc(100vh-6rem)] max-h-[800px]">
          <ChatContainer />
        </div>
        <div className="h-[calc(100vh-6rem)] max-h-[800px]">
          <ImageGenerator />
        </div>
      </div>
    </div>
  );
};

export default Generation;
