
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { CelebrityReport } from "@/types/reports";
import { Button } from "@/components/ui/button";

interface ChatContainerProps {
  selectedReport?: CelebrityReport | null;
}

export const ChatContainer = ({ selectedReport }: ChatContainerProps) => {
  const { messages, prompt, loading, setPrompt, handleSubmit } = useChat(selectedReport);

  const suggestedPrompts = selectedReport ? [
    `What actions should ${selectedReport.celebrity_name} take to improve engagement?`,
    `What are the best posting times for ${selectedReport.celebrity_name}?`,
    `What content strategy would work best for ${selectedReport.celebrity_name}?`,
    `How can ${selectedReport.celebrity_name} monetize their following better?`,
  ] : [
    "What are effective social media growth strategies?",
    "How can I improve engagement rates?",
    "What are the best practices for content creation?",
    "How to optimize posting schedules?",
  ];

  const handlePromptClick = (promptText: string) => {
    setPrompt(promptText);
    handleSubmit();
  };

  return (
    <Card className="h-[calc(100vh-6rem)] shadow-lg">
      <CardHeader className="border-b bg-muted/50 py-2">
        <CardTitle className="text-lg font-semibold text-primary">
          {selectedReport ? `Chat about ${selectedReport.celebrity_name}` : 'Social Media Expert'}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestedPrompts.map((promptText, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handlePromptClick(promptText)}
            >
              {promptText}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-7rem)] p-0">
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
