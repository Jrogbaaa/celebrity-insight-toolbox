
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

export const ChatMessages = ({
  messages,
  loading
}: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current && !loading) {
      const shouldScroll = messages[messages.length - 1]?.role === 'user';
      if (shouldScroll) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  }, [messages, loading]);

  return (
    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-3 space-y-3 py-[10px]">
      <div className="space-y-3">
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
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
  );
};
