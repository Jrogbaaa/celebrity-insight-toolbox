
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, MessageCircle, Share2 } from "lucide-react";

interface MetricsGridProps {
  data: {
    followers: number;
    engagementRate: number;
    commentsPerPost: number;
    sharesPerPost: number;
    following?: number;
    averageLikes?: number;
  };
}

export const MetricsGrid = ({ data }: MetricsGridProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const metricsConfig = [
    {
      title: "Total Followers",
      value: data.followers > 0 ? formatNumber(data.followers) : null,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Following",
      value: data.following && data.following > 0 ? data.following.toString() : null,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Engagement Rate",
      value: data.engagementRate > 0 ? `${data.engagementRate}%` : null,
      icon: Heart,
      color: "from-purple-400 to-purple-500",
    },
    {
      title: "Average Likes",
      value: data.averageLikes && data.averageLikes > 0 ? formatNumber(data.averageLikes) : null,
      icon: Heart,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Comments/Post",
      value: data.commentsPerPost > 0 ? formatNumber(data.commentsPerPost) : null,
      icon: MessageCircle,
      color: "from-purple-400 to-purple-500",
    },
  ];

  return (
    <>
      {metricsConfig
        .filter(metric => metric.value !== null)
        .map((metric) => (
          <Card key={metric.title} className="overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient 
              opacity-5 bg-gradient-to-br ${metric.color}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
    </>
  );
};
