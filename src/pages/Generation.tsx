
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Generation = () => {
  return (
    <div className="container max-w-4xl py-2">
      <h1 className="text-xl font-bold mb-2 text-primary">AI Content Expert</h1>
      <Tabs defaultValue="chat">
        <TabsList className="w-full">
          <TabsTrigger value="chat">AI Chat Expert</TabsTrigger>
          <TabsTrigger value="image">Image Generation</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <ChatContainer />
        </TabsContent>
        <TabsContent value="image">
          <ImageGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Generation;
