
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, MessageCircle, Share2, TrendingUp, CircleUser } from "lucide-react";

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
      iconColor: "#9b87f5",
    },
    {
      title: "Following",
      value: data.following && data.following > 0 ? data.following.toString() : null,
      icon: CircleUser,
      color: "from-blue-500 to-blue-600",
      iconColor: "#0EA5E9",
    },
    {
      title: "Engagement Rate",
      value: data.engagementRate > 0 ? `${data.engagementRate}%` : null,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      iconColor: "#10B981",
    },
    {
      title: "Average Likes",
      value: data.averageLikes && data.averageLikes > 0 ? formatNumber(data.averageLikes) : null,
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      iconColor: "#EC4899",
    },
    {
      title: "Comments/Post",
      value: data.commentsPerPost > 0 ? formatNumber(data.commentsPerPost) : null,
      icon: MessageCircle,
      color: "from-orange-500 to-orange-600",
      iconColor: "#F97316",
    }
  ];

  return (
    <>
      {metricsConfig
        .filter(metric => metric.value !== null)
        .map((metric) => (
          <Card key={metric.title} className="overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                {metric.title}
              </CardTitle>
              <metric.icon 
                className="h-5 w-5" 
                style={{ color: metric.iconColor }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: metric.iconColor }}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
    </>
  );
};
