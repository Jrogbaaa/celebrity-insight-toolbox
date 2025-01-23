import { BarChart2, MessageCircle } from "lucide-react";

export const InstagramFeatureList = () => {
  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center gap-2 text-left">
        <BarChart2 className="h-5 w-5 text-blue-500" />
        <span>View detailed analytics and insights</span>
      </div>
      <div className="flex items-center gap-2 text-left">
        <MessageCircle className="h-5 w-5 text-green-500" />
        <span>Manage your Instagram messages</span>
      </div>
    </div>
  );
};