
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

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
  
  const [micActive, setMicActive] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit();
  };

  // Handle microphone toggling
  const toggleRecording = async () => {
    if (isRecording || micActive) {
      stopRecording();
      setMicActive(false);
    } else {
      const started = await startRecording();
      if (started) {
        setMicActive(true);
        toast({
          title: "Microphone Active",
          description: "Speak now. Click the microphone button again to stop.",
          variant: "default",
        });
      }
    }
  };

  // Update prompt when transcript changes
  useEffect(() => {
    if (transcript) {
      onPromptChange(transcript);
      
      // Focus the textarea when transcript is received
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [transcript, onPromptChange]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        ref={textareaRef}
        placeholder="Type your message or click the mic to speak..."
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
        disabled={loading}
        className={`px-3 h-[35px] ${(isRecording || micActive) ? 'bg-red-500 hover:bg-red-600' : ''}`}
        variant={(isRecording || micActive) ? "destructive" : "outline"}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {processingAudio ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (isRecording || micActive) ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      <Button 
        type="submit"
        disabled={loading || processingAudio || !prompt.trim()} 
        className="px-3 h-[35px]"
        aria-label="Send message"
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
