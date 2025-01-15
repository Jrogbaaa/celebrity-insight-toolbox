import { Card } from "@/components/ui/card";
import { MessageSender } from "@/components/MessageSender";

const Generation = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create Content</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Send Instagram Message</h2>
        <MessageSender />
      </Card>
    </div>
  );
};

export default Generation;