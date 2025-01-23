import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Generation = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: { prompt },
      });

      if (error) {
        // Parse the error response
        const errorBody = error.message && JSON.parse(error.message);
        
        // Handle specific error cases
        if (errorBody?.error === "Rate Limit Exceeded") {
          throw new Error("The service is currently busy. Please try again in a few minutes.");
        }
        if (errorBody?.error === "Service Unavailable") {
          throw new Error("The AI service is temporarily unavailable. Please try again later.");
        }
        
        throw error;
      }

      setResponse(data.generatedText);
      toast({
        title: "Success",
        description: "Content generated successfully!",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">AI Content Expert</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe what kind of content you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mb-4 min-h-[100px]"
            />
            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Content"}
            </Button>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">{response}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Generation;