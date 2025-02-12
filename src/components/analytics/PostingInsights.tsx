
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface PostingInsightsProps {
  insights: {
    general_best_times: {
      monday: string[];
      tuesday: string[];
      thursday: string[];
    };
    peak_engagement_times: string[];
    posting_tips: string[];
  };
}

export const PostingInsights = ({ insights }: PostingInsightsProps) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Posting Time Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Best Times to Post</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="font-medium">Monday:</span>
                <span className="text-muted-foreground">{insights.general_best_times.monday.join(", ")}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Tuesday:</span>
                <span className="text-muted-foreground">{insights.general_best_times.tuesday.join(", ")}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Thursday:</span>
                <span className="text-muted-foreground">{insights.general_best_times.thursday.join(", ")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Peak Engagement Times</h3>
            <p className="text-muted-foreground">
              Highest engagement occurs at {insights.peak_engagement_times.join(" and ")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tips for Better Engagement</h3>
            <ul className="list-disc list-inside space-y-1">
              {insights.posting_tips.map((tip, index) => (
                <li key={index} className="text-muted-foreground">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
