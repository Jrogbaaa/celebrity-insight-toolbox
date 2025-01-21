import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useInstagramAnalysis } from "@/services/InstagramService";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");
  const { toast } = useToast();
  
  const { data: metrics, isLoading, error } = useInstagramAnalysis(searchedUsername);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter an Instagram username to analyze",
        variant: "destructive",
      });
      return;
    }

    setSearchedUsername(username.trim());
  };

  if (error) {
    toast({
      title: "Analysis failed",
      description: error.message || "Unable to analyze this profile. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Instagram Analytics</h1>
      
      <Card className="mb-8 p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter Instagram username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="max-w-md"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Profile
              </>
            )}
          </Button>
        </form>
      </Card>

      {metrics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsGrid />
          </div>
          <div className="grid gap-4 mt-8">
            <EngagementChart />
            {metrics.posts && <PostTimingAnalyzer posts={metrics.posts} />}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;