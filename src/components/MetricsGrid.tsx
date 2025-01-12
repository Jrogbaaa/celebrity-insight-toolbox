import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, Heart, MessageCircle, Share2 } from "lucide-react";
import { useSocialMediaMetrics } from "@/services/SocialMediaService";

export const MetricsGrid = () => {
  const { data: metrics, isLoading } = useSocialMediaMetrics();

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  const metricsConfig = [
    {
      title: "Total Followers",
      value: metrics ? `${(metrics.followers / 1000).toFixed(1)}K` : "0",
      change: "+2.5%",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Engagement Rate",
      value: metrics ? `${metrics.engagementRate}%` : "0%",
      change: "+0.3%",
      isPositive: true,
      icon: Heart,
    },
    {
      title: "Comments/Post",
      value: metrics ? metrics.commentsPerPost.toString() : "0",
      change: "-1.2%",
      isPositive: false,
      icon: MessageCircle,
    },
    {
      title: "Shares/Post",
      value: metrics ? metrics.sharesPerPost.toString() : "0",
      change: "+4.5%",
      isPositive: true,
      icon: Share2,
    },
  ];

  return (
    <>
      {metricsConfig.map((metric) => (
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