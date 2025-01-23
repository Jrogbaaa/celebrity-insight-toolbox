import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current && !loading) {
      const shouldScroll = messages[messages.length - 1]?.role === 'user';
      if (shouldScroll) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  }, [messages, loading]);

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
        let errorMessage = "Failed to generate response. Please try again.";
        
        try {
          const errorBody = error.message && JSON.parse(error.message);
          
          if (errorBody?.error === "Insufficient Balance") {
            errorMessage = "The AI service is currently unavailable due to insufficient credits. Please try again later or contact support.";
          } else if (errorBody?.error === "Rate Limit Exceeded") {
            errorMessage = "The service is currently busy. Please try again in a few minutes.";
          } else if (errorBody?.error === "Service Unavailable") {
            errorMessage = "The AI service is temporarily unavailable. Please try again later.";
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
        }
        
        throw new Error(errorMessage);
      }

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
    <div className="container max-w-4xl py-2">
      <h1 className="text-xl font-bold mb-2 text-primary">AI Content Expert</h1>
      
      <Card className="h-[calc(100vh-6rem)] shadow-lg">
        <CardHeader className="border-b bg-muted/50 py-2">
          <CardTitle className="text-lg font-semibold text-primary">Chat with AI</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-3.5rem)] p-0">
          <div 
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto p-3 space-y-3"
          >
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-1.5 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
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
          </div>
          
          <form onSubmit={handleSubmit} className="p-2 border-t bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[35px] max-h-[35px] bg-background resize-none"
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
                className="px-3 h-[35px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Generation;