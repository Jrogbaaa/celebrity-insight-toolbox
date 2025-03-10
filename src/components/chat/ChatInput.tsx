
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useEffect, useState } from "react";

interface ChatInputProps {
  prompt: string;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChatInput = ({ prompt, loading, onPromptChange, onSubmit }: ChatInputProps) => {
  const { 
    isRecording, 
    transcript, 
    processingAudio, 
    startRecording, 
    stopRecording 
  } = useSpeechToText();
  
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      setIsListening(false);
    } else {
      await startRecording();
      setIsListening(true);
    }
  };

  // Update prompt when transcript changes
  useEffect(() => {
    if (transcript) {
      onPromptChange(transcript);
    }
  }, [transcript, onPromptChange]);

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
      <Button
        type="button"
        onClick={toggleRecording}
        disabled={loading || processingAudio}
        className={`px-3 h-[35px] ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
        variant={isRecording ? "destructive" : "outline"}
      >
        {processingAudio ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      <Button 
        type="submit"
        disabled={loading || processingAudio} 
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
