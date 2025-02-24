
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";

const Generation = () => {
  return (
    <div className="container max-w-7xl py-2">
      <h1 className="text-xl font-bold mb-4 text-primary">AI Content Expert</h1>
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
        <div className="h-[500px]">
          <ChatContainer />
        </div>
        <div className="h-fit">
          <ImageGenerator />
        </div>
      </div>
    </div>
  );
};

export default Generation;
