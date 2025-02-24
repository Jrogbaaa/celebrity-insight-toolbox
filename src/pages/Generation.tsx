import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";
const Generation = () => {
  return <div className="container max-w-7xl py-2">
      <h1 className="text-xl font-bold mb-2 text-primary">
    </h1>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <div className="h-[600px] md:h-[700px]">
          <ChatContainer />
        </div>
        <div className="h-fit">
          <ImageGenerator />
        </div>
      </div>
    </div>;
};
export default Generation;