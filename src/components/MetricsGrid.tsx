
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, Heart, MessageCircle, Share2, Upload } from "lucide-react";

interface MetricsGridProps {
  data: {
    followers: number;
    engagementRate: number;
    commentsPerPost: number;
    sharesPerPost: number;
    mediaUploads?: number;
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
      change: "-3,660",
      isPositive: false,
      icon: Users,
    },
    {
      title: "Media Uploads",
      value: data.mediaUploads && data.mediaUploads > 0 ? data.mediaUploads.toString() : null,
      change: "+30",
      isPositive: true,
      icon: Upload,
    },
    {
      title: "Following",
      value: data.following && data.following > 0 ? data.following.toString() : null,
      change: "-30",
      isPositive: false,
      icon: Users,
    },
    {
      title: "Engagement Rate",
      value: data.engagementRate > 0 ? `${data.engagementRate}%` : null,
      change: "+0.3%",
      isPositive: true,
      icon: Heart,
    },
    {
      title: "Average Likes",
      value: data.averageLikes && data.averageLikes > 0 ? formatNumber(data.averageLikes) : null,
      change: "+2.5%",
      isPositive: true,
      icon: Heart,
    },
    {
      title: "Comments/Post",
      value: data.commentsPerPost > 0 ? formatNumber(data.commentsPerPost) : null,
      change: "+1.2%",
      isPositive: true,
      icon: MessageCircle,
    },
  ];

  return (
    <>
      {metricsConfig
        .filter(metric => metric.value !== null)
        .map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`flex items-center text-xs ${
                metric.isPositive ? "text-success" : "text-destructive"
              }`}>
                {metric.isPositive ? (
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                )}
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
    </>
  );
};
