
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTTS = () => {
  const [enabled, setEnabled] = useState<boolean>(
    localStorage.getItem("tts-enabled") === "true"
  );
  const [speaking, setSpeaking] = useState<boolean>(false);
  const { toast } = useToast();

  // Save the preference to localStorage whenever it changes
  const toggleTTS = useCallback(() => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem("tts-enabled", String(newState));
  }, [enabled]);

  const speakText = useCallback(async (text: string) => {
    if (!enabled || !text) return;

    try {
      setSpeaking(true);
      
      // Call the edge function to convert text to speech
      const { data, error } = await supabase.functions.invoke("google-tts", {
        body: { text },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.audioContent) {
        throw new Error("No audio content returned");
      }

      // Play the audio
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioSrc);
      
      audio.onended = () => {
        setSpeaking(false);
      };
      
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setSpeaking(false);
        toast({
          title: "Audio Error",
          description: "Failed to play the audio response",
          variant: "destructive",
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setSpeaking(false);
      toast({
        title: "Text-to-Speech Error",
        description: error instanceof Error ? error.message : "Failed to convert text to speech",
        variant: "destructive",
      });
    }
  }, [enabled, toast]);

  return {
    ttsEnabled: enabled,
    speaking,
    toggleTTS,
    speakText
  };
};
