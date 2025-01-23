import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Generation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadConversation = async () => {
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading conversation:', error);
        return;
      }

      if (conversations && conversations.length > 0) {
        setConversationId(conversations[0].id);
        const savedMessages = conversations[0].messages as Array<{
          role: 'user' | 'assistant';
          content: string;
        }>;
        setMessages(savedMessages);
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('chat_conversations')
          .insert([{ messages: [] }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          return;
        }

        if (newConversation) {
          setConversationId(newConversation.id);
        }
      }
    };

    loadConversation();
  }, []);

  const updateConversation = async (newMessages: Message[]) => {
    if (!conversationId) return;

    const { error } = await supabase
      .from('chat_conversations')
      .update({ 
        messages: newMessages,
        updated_at: new Date().toISOString() 
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to save conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message first",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: prompt.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    await updateConversation(newMessages);

    try {
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: { 
          messages: newMessages
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

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.generatedText 
      };
      
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      await updateConversation(updatedMessages);

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
          <ChatMessages messages={messages} loading={loading} />
          <ChatInput 
            prompt={prompt}
            loading={loading}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Generation;