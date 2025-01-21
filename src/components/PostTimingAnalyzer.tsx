import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Post {
  timestamp: string;
  likes: number;
  comments: number;
}

interface TimeAnalysis {
  hour: string;
  avgEngagement: number;
  postCount: number;
}

const analyzeTiming = (posts: Post[]) => {
  // Create 24 hour buckets
  const hourlyData: { [key: string]: { totalEngagement: number; count: number } } = {};
  
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    hourlyData[hour] = { totalEngagement: 0, count: 0 };
  }

  // Analyze each post
  posts.forEach(post => {
    const hour = new Date(post.timestamp).getHours().toString().padStart(2, '0');
    const engagement = post.likes + post.comments;
    
    hourlyData[hour].totalEngagement += engagement;
    hourlyData[hour].count += 1;
  });

  // Convert to array and calculate averages
  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: `${hour}:00`,
    avgEngagement: data.count > 0 ? data.totalEngagement / data.count : 0,
    postCount: data.count
  }));
};

export const PostTimingAnalyzer = ({ posts }: { posts: Post[] }) => {
  const timeAnalysis = analyzeTiming(posts);
  
  // Find best posting times
  const bestTimes = [...timeAnalysis]
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .filter(time => time.postCount > 0)
    .slice(0, 3);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Best Times to Post</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="space-y-2">
            {bestTimes.map((time, index) => (
              <div key={time.hour} className="flex items-center justify-between">
                <span className="text-sm">
                  {index + 1}. {time.hour}
                </span>
                <span className="text-sm text-muted-foreground">
                  Avg. Engagement: {Math.round(time.avgEngagement)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avgEngagement"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="Average Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};