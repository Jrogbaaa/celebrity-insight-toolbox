import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadConversation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading conversation:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (conversations && conversations.length > 0) {
        setConversationId(conversations[0].id);
        const messagesData = conversations[0].messages as Json[];
        const typedMessages = Array.isArray(messagesData) 
          ? messagesData.map(msg => ({
              role: (msg as any).role as 'user' | 'assistant',
              content: (msg as any).content as string
            }))
          : [];
        setMessages(typedMessages);
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('chat_conversations')
          .insert([{ 
            messages: [] as Json[],
            user_id: session.user.id
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          toast({
            title: "Error",
            description: "Failed to create conversation. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (newConversation) {
          setConversationId(newConversation.id);
        }
      }
    };

    loadConversation();
  }, [toast]);

  const updateConversation = async (newMessages: Message[]) => {
    if (!conversationId) return;

    const { error } = await supabase
      .from('chat_conversations')
      .update({ 
        messages: newMessages as unknown as Json[],
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

  return {
    messages,
    prompt,
    loading,
    setPrompt,
    handleSubmit
  };
};