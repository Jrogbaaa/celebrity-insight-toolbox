
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";

const Generation = () => {
  return (
    <div className="container max-w-7xl py-2">
      <h1 className="text-xl font-bold mb-2 text-primary">AI Content Expert</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChatContainer />
        <ImageGenerator />
      </div>
    </div>
  );
};

export default Generation;
