import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Generation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message first",
        variant: "destructive",
      });
      return;
    }

    // Add user message immediately
    const userMessage: Message = { role: 'user', content: prompt.trim() };
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: { 
          messages: [...messages, userMessage]
        },
      });

      if (error) {
        const errorBody = error.message && JSON.parse(error.message);
        
        if (errorBody?.error === "Rate Limit Exceeded") {
          throw new Error("The service is currently busy. Please try again in a few minutes.");
        }
        if (errorBody?.error === "Service Unavailable") {
          throw new Error("The AI service is temporarily unavailable. Please try again later.");
        }
        
        throw error;
      }

      // Add AI response to messages
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.generatedText 
      }]);

    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">AI Content Expert</h1>
      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader>
          <CardTitle>Chat with AI</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-5rem)] pb-4">
          <ScrollArea className="flex-1 pr-4">
            {messages.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Start a conversation with the AI Content Expert. Ask questions or request content generation!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button 
              type="submit"
              disabled={loading} 
              className="px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Generation;