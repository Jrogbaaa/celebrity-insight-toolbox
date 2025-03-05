
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { CelebrityReport } from "@/types/reports";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Send, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatContainerProps {
  selectedReport?: CelebrityReport | null;
}

export const ChatContainer = ({ selectedReport }: ChatContainerProps) => {
  const { messages, prompt, loading, error, setPrompt, handleSubmit } = useChat(selectedReport);
  const [showError, setShowError] = useState(false);

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

  const handlePromptClick = async (promptText: string) => {
    await setPrompt(promptText);
    const result = await handleSubmit(promptText);
    if (!result.success) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <Card className="h-full shadow-lg flex flex-col overflow-hidden animate-fade-in">
      <CardHeader className="border-b bg-muted/50 py-2">
        <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {selectedReport ? `Chat about ${selectedReport.celebrity_name}` : 'Social Media Expert'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col h-[calc(100%-60px)] overflow-hidden">
        {showError && error && (
          <Alert variant="destructive" className="m-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.includes("insufficient") ? 
                "The AI service is currently unavailable. Please try again later." : 
                error}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-y-auto relative">
          <ChatMessages messages={messages} loading={loading} />
        </div>
        <div className="p-2 space-y-2 border-t bg-muted/30">
          <div className="flex flex-wrap gap-1">
            {suggestedPrompts.map((promptText, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 hover:scale-105 transition-transform"
                onClick={() => handlePromptClick(promptText)}
                disabled={loading}
              >
                {promptText}
              </Button>
            ))}
          </div>
          <ChatInput 
            prompt={prompt}
            loading={loading}
            onPromptChange={setPrompt}
            onSubmit={() => handleSubmit()}
          />
        </div>
      </CardContent>
    </Card>
  );
};
