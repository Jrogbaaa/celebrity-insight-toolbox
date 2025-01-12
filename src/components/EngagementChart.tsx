import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSocialMediaMetrics } from "@/services/SocialMediaService";

export const EngagementChart = () => {
  const { data: metrics, isLoading } = useSocialMediaMetrics();

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Engagement Over Time</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics?.recentPosts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#8B5CF6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};