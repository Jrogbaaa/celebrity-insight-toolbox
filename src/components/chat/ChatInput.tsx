import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  prompt: string;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChatInput = ({ prompt, loading, onPromptChange, onSubmit }: ChatInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 border-t bg-muted/30">
      <div className="flex gap-2">
        <Textarea
          placeholder="Type your message..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[35px] max-h-[35px] bg-background resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
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
  );
};