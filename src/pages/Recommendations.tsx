import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Recommendations = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = () => {
    setLoading(true);
    // TODO: Implement AI recommendations
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">AI Recommendations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ask AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Ask about your social media strategy..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button onClick={handleAsk} disabled={loading}>
              {loading ? "Thinking..." : "Ask"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;