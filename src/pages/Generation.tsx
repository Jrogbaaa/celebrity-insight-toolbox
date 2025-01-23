import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Info } from "lucide-react";

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
        let errorMessage = "Failed to generate response. Please try again.";
        
        // Parse the error message if it's in JSON format
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
      <h1 className="text-3xl font-bold mb-8 text-primary">AI Content Expert</h1>
      
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Usage Information</AlertTitle>
        <AlertDescription>
          This chat uses the DeepSeek API. Each message is charged based on the number of tokens used (approximately 1000 tokens per 750 words). The exact cost depends on your usage and DeepSeek's pricing.
        </AlertDescription>
      </Alert>

      <Card className="h-[calc(100vh-12rem)] shadow-lg">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-2xl font-semibold text-primary">Chat with AI</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-5rem)] p-0">
          <div 
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {messages.length === 0 ? (
              <Alert className="bg-muted/50 border-primary/20">
                <AlertDescription className="text-muted-foreground">
                  Start a conversation with the AI Content Expert. Ask questions or request content generation!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${
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
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[60px] bg-background resize-none"
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
                className="px-6 h-[60px]"
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