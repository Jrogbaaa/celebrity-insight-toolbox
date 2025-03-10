
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  prompt: string;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  ttsEnabled?: boolean;
  onTtsToggle?: () => void;
}

export const ChatInput = ({ 
  prompt, 
  loading, 
  onPromptChange, 
  onSubmit,
  ttsEnabled = false,
  onTtsToggle 
}: ChatInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
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
      {onTtsToggle && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onTtsToggle}
                className="h-[35px] w-[35px]"
              >
                {ttsEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <Button 
        type="submit"
        disabled={loading} 
        className="px-3 h-[35px]"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};
