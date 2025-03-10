
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [processingAudio, setProcessingAudio] = useState(false);
  const { toast } = useToast();
  
  // Use refs for mediaRecorder and stream to properly clean up
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up function for media resources
  const cleanupMedia = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
  }, []);

  // Initialize media recorder
  const initRecorder = useCallback(async () => {
    try {
      // Clean up any existing recorder/stream
      cleanupMedia();
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Create new MediaRecorder with WEBM OPUS format for best compatibility with Google Speech API
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus',
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, e.data]);
        }
      };
      
      mediaRecorderRef.current = recorder;
      return true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive',
      });
      return false;
    }
  }, [cleanupMedia, toast]);

  // Start recording
  const startRecording = useCallback(async () => {
    // Reset state
    setAudioChunks([]);
    setTranscript('');
    
    // Initialize recorder
    const initialized = await initRecorder();
    if (!initialized || !mediaRecorderRef.current) return false;
    
    // Start recording with small time slices to collect data frequently
    mediaRecorderRef.current.start(100);
    setIsRecording(true);
    return true;
  }, [initRecorder]);

  // Stop recording and process audio
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return;
    }
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    
    // Process recorded audio
    setTimeout(() => {
      processRecording();
    }, 100); // Small delay to ensure all chunks are collected
    
    // Clean up media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Process the recorded audio
  const processRecording = useCallback(async () => {
    if (audioChunks.length === 0) {
      toast({
        title: 'No Audio Recorded',
        description: 'No audio was captured. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    
    setProcessingAudio(true);
    
    try {
      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
      
      // For debugging
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);
      
      // Convert blob to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          // Get base64 data
          const base64Audio = (reader.result as string).split(',')[1];
          
          console.log('Sending audio to speech-to-text function...');
          
          // Send to our Supabase function
          const { data, error } = await supabase.functions.invoke('speech-to-text', {
            body: { audio: base64Audio },
          });
          
          if (error) {
            console.error('Error transcribing audio:', error);
            throw new Error(error.message || 'Failed to transcribe audio');
          }
          
          if (data && data.text) {
            console.log('Transcription received:', data.text);
            setTranscript(data.text);
          } else {
            console.log('No transcription received');
            setTranscript('');
            toast({
              title: 'No Speech Detected',
              description: "We couldn't detect any speech. Please try again.",
              variant: 'default',
            });
          }
        } catch (err) {
          console.error('Error processing transcription:', err);
          toast({
            title: 'Transcription Failed',
            description: err instanceof Error ? err.message : 'Could not transcribe audio. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setProcessingAudio(false);
        }
      };
      
      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        toast({
          title: 'Processing Error',
          description: 'There was an error processing your audio.',
          variant: 'destructive',
        });
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
  }, [audioChunks, toast]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  return {
    isRecording,
    transcript,
    processingAudio,
    startRecording,
    stopRecording,
  };
};
