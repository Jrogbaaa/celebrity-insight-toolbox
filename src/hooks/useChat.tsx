
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { CelebrityReport } from "@/types/reports";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = (selectedReport?: CelebrityReport | null) => {
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

  const handleSubmit = async (forcedPrompt?: string) => {
    const promptToUse = forcedPrompt || prompt;
    
    if (!promptToUse.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message first",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: promptToUse.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    await updateConversation(newMessages);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { 
          prompt: promptToUse.trim(),
          context: messages.length > 0 ? messages[messages.length - 1].content : undefined,
          celebrityData: selectedReport ? {
            name: selectedReport.celebrity_name,
            username: selectedReport.username,
            platform: selectedReport.platform,
            analytics: selectedReport.report_data
          } : undefined
        },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response 
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
