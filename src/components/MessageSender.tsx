import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendInstagramMessage } from "@/services/InstagramMessageService";

export const MessageSender = () => {
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!recipientId || !message) {
      toast({
        title: "Error",
        description: "Please provide both recipient ID and message",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      await sendInstagramMessage(recipientId, message);
      
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      
      // Clear form after successful send
      setMessage("");
      setRecipientId("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Recipient ID"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
        />
        <Input
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button 
        onClick={handleSendMessage}
        disabled={isSending || !recipientId || !message}
      >
        {isSending ? "Sending..." : "Send Message"}
      </Button>
    </div>
  );
};