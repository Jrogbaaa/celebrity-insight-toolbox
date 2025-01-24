import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";

export const ChatContainer = () => {
  const { messages, prompt, loading, setPrompt, handleSubmit } = useChat();

  return (
    <Card className="h-[calc(100vh-6rem)] shadow-lg">
      <CardHeader className="border-b bg-muted/50 py-2">
        <CardTitle className="text-lg font-semibold text-primary">Chat with AI</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-3.5rem)] p-0">
        <ChatMessages messages={messages} loading={loading} />
        <ChatInput 
          prompt={prompt}
          loading={loading}
          onPromptChange={setPrompt}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
};