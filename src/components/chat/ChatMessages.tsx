
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

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
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div 
      ref={scrollAreaRef} 
      className="flex-1 overflow-y-auto p-3 space-y-3 py-[10px] scroll-smooth"
    >
      <div className="space-y-3">
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-muted rounded-lg px-3 py-1.5 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="size-2 bg-primary/60 rounded-full animate-bounce" />
                <span className="size-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="size-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
