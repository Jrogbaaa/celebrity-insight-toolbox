
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  // Remove markdown asterisks from content
  const cleanContent = content.replace(/\*\*/g, '');
  
  return (
    <div
      className={`flex ${
        role === 'user' ? 'justify-end' : 'justify-start'
      } animate-fade-in`}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-1.5 shadow-sm",
          role === 'user'
            ? 'bg-primary text-primary-foreground ml-4'
            : 'bg-muted mr-4'
        )}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {cleanContent}
        </div>
      </div>
    </div>
  );
};
