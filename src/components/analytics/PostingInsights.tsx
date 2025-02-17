
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface PostingInsightsProps {
  insights: {
    general_best_times?: {
      monday?: string[];
      tuesday?: string[];
      thursday?: string[];
    };
    peak_engagement_times?: string[];
    posting_tips?: string[];
  };
}

export const PostingInsights = ({ insights }: PostingInsightsProps) => {
  // Early return if no insights provided
  if (!insights) {
    return null;
  }

  const { general_best_times, peak_engagement_times, posting_tips } = insights;

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
          {general_best_times && (
            <div>
              <h3 className="font-semibold mb-2">Best Times to Post</h3>
              <div className="space-y-2">
                {general_best_times.monday && (
                  <div className="flex gap-2">
                    <span className="font-medium">Monday:</span>
                    <span className="text-muted-foreground">
                      {general_best_times.monday.join(", ")}
                    </span>
                  </div>
                )}
                {general_best_times.tuesday && (
                  <div className="flex gap-2">
                    <span className="font-medium">Tuesday:</span>
                    <span className="text-muted-foreground">
                      {general_best_times.tuesday.join(", ")}
                    </span>
                  </div>
                )}
                {general_best_times.thursday && (
                  <div className="flex gap-2">
                    <span className="font-medium">Thursday:</span>
                    <span className="text-muted-foreground">
                      {general_best_times.thursday.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {peak_engagement_times && peak_engagement_times.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Peak Engagement Times</h3>
              <p className="text-muted-foreground">
                Highest engagement occurs at {peak_engagement_times.join(" and ")}
              </p>
            </div>
          )}

          {posting_tips && posting_tips.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tips for Better Engagement</h3>
              <ul className="list-disc list-inside space-y-1">
                {posting_tips.map((tip, index) => (
                  <li key={index} className="text-muted-foreground">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
