
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [processingAudio, setProcessingAudio] = useState(false);
  const { toast } = useToast();

  // Initialize media recorder
  const initRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, e.data]);
        }
      };

      recorder.onstop = async () => {
        setProcessingAudio(true);
        
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio },
            });
            
            if (error) {
              console.error('Error transcribing audio:', error);
              toast({
                title: 'Transcription Failed',
                description: 'Could not transcribe audio. Please try again.',
                variant: 'destructive',
              });
              setProcessingAudio(false);
              return;
            }
            
            if (data && data.text) {
              setTranscript(data.text);
            } else {
              setTranscript('');
              toast({
                title: 'No Speech Detected',
                description: 'We couldn\'t detect any speech. Please try again.',
                variant: 'default',
              });
            }
            
            setProcessingAudio(false);
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (err) {
          console.error('Error processing audio:', err);
          toast({
            title: 'Processing Error',
            description: 'There was an error processing your audio.',
            variant: 'destructive',
          });
          setProcessingAudio(false);
        }
      };
      
      setMediaRecorder(recorder);
      return recorder;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive',
      });
      return null;
    }
  }, [audioChunks, toast]);

  // Start recording
  const startRecording = useCallback(async () => {
    setAudioChunks([]);
    setTranscript('');
    
    let recorder = mediaRecorder;
    if (!recorder) {
      recorder = await initRecorder();
      if (!recorder) return;
    }
    
    recorder.start(100);
    setIsRecording(true);
  }, [mediaRecorder, initRecorder]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  return {
    isRecording,
    transcript,
    processingAudio,
    startRecording,
    stopRecording
  };
};
