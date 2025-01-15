import { supabase } from "@/integrations/supabase/client";

export const sendInstagramMessage = async (recipientId: string, messageText: string) => {
  try {
    console.log('Sending message to Instagram...', { recipientId, messageText });
    
    const { data, error } = await supabase.functions.invoke('send-instagram-message', {
      body: { 
        recipientId, 
        messageText 
      }
    });

    if (error) {
      console.error('Error sending message:', error);
      throw new Error(error.message);
    }

    console.log('Message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in sendInstagramMessage:', error);
    throw error;
  }
};