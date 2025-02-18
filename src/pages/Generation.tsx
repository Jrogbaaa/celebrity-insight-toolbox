
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ImageGenerator } from "@/components/image/ImageGenerator";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

const Generation = () => {
  const imageGeneratorRef = useRef<HTMLDivElement>(null);

  const scrollToImageGenerator = () => {
    imageGeneratorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="container max-w-4xl py-2">
      <h1 className="text-xl font-bold mb-2 text-primary">AI Content Expert</h1>
      <div className="grid gap-4">
        <div className="relative">
          <ChatContainer />
          <Button
            onClick={scrollToImageGenerator}
            className="absolute bottom-4 right-4 z-10"
            variant="secondary"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Generate Images
          </Button>
        </div>
        <div ref={imageGeneratorRef}>
          <ImageGenerator />
        </div>
      </div>
    </div>
  );
};

export default Generation;
