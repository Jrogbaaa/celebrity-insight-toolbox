import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search } from "lucide-react";
import { useSocialMediaMetrics } from "@/services/SocialMediaService";

const Analytics = () => {
  const [username, setUsername] = useState("");
  const { data: metrics, isLoading } = useSocialMediaMetrics();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would trigger fetching data for the specified username
    console.log("Searching for:", username);
  };

  if (isLoading) {
    return <div>Loading analytics...</div>;
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
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Analyze Profile
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsGrid />
      </div>
      <div className="grid gap-4 mt-8">
        <EngagementChart />
        {metrics?.posts && <PostTimingAnalyzer posts={metrics.posts} />}
      </div>
    </div>
  );
};

export default Analytics;