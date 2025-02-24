import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, MessageCircle, Share2, TrendingUp, CircleUser } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

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
      delay: 0
    },
    {
      title: "Following",
      value: data.following && data.following > 0 ? data.following.toString() : null,
      icon: CircleUser,
      color: "from-blue-500 to-blue-600",
      iconColor: "#0EA5E9",
      delay: 0.1
    },
    {
      title: "Engagement Rate",
      value: data.engagementRate > 0 ? `${data.engagementRate}%` : null,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      iconColor: "#10B981",
      delay: 0.2
    },
    {
      title: "Average Likes",
      value: data.averageLikes && data.averageLikes > 0 ? formatNumber(data.averageLikes) : null,
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      iconColor: "#EC4899",
      delay: 0.3
    },
    {
      title: "Comments/Post",
      value: data.commentsPerPost > 0 ? formatNumber(data.commentsPerPost) : null,
      icon: MessageCircle,
      color: "from-orange-500 to-orange-600",
      iconColor: "#F97316",
      delay: 0.4
    }
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
        <AnimatePresence>
          {metricsConfig
            .filter(metric => metric.value !== null)
            .map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: metric.delay }}
                whileHover={{ scale: 1.02 }}
                className="w-full"
              >
                <Card className="overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 
                    group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4 md:px-6">
                    <CardTitle className="text-base md:text-lg font-medium text-primary">
                      {metric.title}
                    </CardTitle>
                    <metric.icon 
                      className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:scale-110 flex-shrink-0" 
                      style={{ color: metric.iconColor }}
                    />
                  </CardHeader>
                  <CardContent className="pb-4 pt-0 px-4 md:px-6">
                    <div 
                      className="text-2xl md:text-3xl font-bold transition-all duration-300 group-hover:scale-105" 
                      style={{ color: metric.iconColor }}
                    >
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};
