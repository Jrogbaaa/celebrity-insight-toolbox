import { ChatContainer } from "@/components/chat/ChatContainer";
import { Card } from "@/components/ui/card";

const Generation = () => {
  return (
    <div className="container max-w-4xl py-2">
      <h1 className="text-xl font-bold mb-2 text-primary">AI Content Expert</h1>
      <ChatContainer />
    </div>
  );
};

export default Generation;