
import React from "react";
import { Sparkles, Clock, Camera } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CelebrityReport } from "@/types/reports";

interface ContentPillar {
  title: string;
  percentage: string;
  description: string;
}

interface AIActionItemsProps {
  selectedReport: CelebrityReport | null;
}

const getContentPillars = (): ContentPillar[] => {
  return [
    {
      title: "Performance Excellence",
      percentage: "40%",
      description: "Professional content, behind-the-scenes, and milestones"
    },
    {
      title: "Authentic Moments",
      percentage: "30%",
      description: "Natural lifestyle content and personal stories"
    },
    {
      title: "Team Interactions",
      percentage: "30%",
      description: "Collaborations and peer engagement"
    }
  ];
};

const getPersonalizedActionItems = (selectedReport: CelebrityReport | null): string[] => {
  if (!selectedReport) return [];

  const actionItems = {
    "Cristina Pedroche": {
      items: [
        "Create behind-the-scenes content of Puma activewear photoshoots during peak hours (10:00 AM)",
        "Share 3-5 story updates from Netflix productions with exclusive footage",
        "Document real-time wellness routines featuring Vital Proteins during morning hours",
        "Film natural try-on sessions with Desigual collections (15-30 second clips)",
        "Collaborate with Zalando influencer network during prime engagement windows",
        "Share unscripted moments with Netflix co-stars to boost cross-promotion"
      ]
    },
    "Jaime Lorente Lopez": {
      items: [
        "Film premium behind-the-scenes content at Armani Beauty events (6:00 PM window)",
        "Create high-quality action shots with Maserati during golden hour",
        "Share natural lifestyle moments wearing Hugo Boss during workday peaks (2:00 PM)",
        "Document authentic training sessions with Oakley gear for sports audience",
        "Coordinate Universal Pictures red carpet moments with co-stars",
        "Plan collaborative content with luxury brand ambassadors during prime times"
      ]
    },
    "Jorge Cremades": {
      items: [
        "Focus comedy sketches around El Corte Inglés shopping experiences",
        "Create lifestyle content featuring Jimmy Choo during peak engagement times",
        "Develop Red Bull-sponsored active lifestyle content",
        "Schedule Lidl content during afternoon shopping hours",
        "Plan Ted Baker fashion content targeting male audience segments"
      ]
    }
  };

  return actionItems[selectedReport.celebrity_name as keyof typeof actionItems]?.items || [];
};

export const AIActionItems: React.FC<AIActionItemsProps> = ({ selectedReport }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Action Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedReport ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Content Strategy Pillars</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {getContentPillars().map((pillar, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{pillar.title}</span>
                      <span className="text-primary">{pillar.percentage}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-semibold text-primary mb-3">Personalized Action Plan</h3>
              <ul className="list-disc list-inside space-y-2">
                {getPersonalizedActionItems(selectedReport).map((item: string, index: number) => (
                  <li key={index} className="text-foreground text-base" dangerouslySetInnerHTML={{
                    __html: item.replace(/(photoshoots|peak hours|exclusive footage|prime engagement windows|golden hour|training sessions|comedy sketches)/g, '<strong>$1</strong>')
                  }} />
                ))}
              </ul>
            </div>
            
            {selectedReport.report_data.posting_insights?.peak_engagement_times && (
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Optimal Posting Windows
                </h3>
                <p className="text-foreground text-base">
                  Peak engagement times: <strong>{selectedReport.report_data.posting_insights.peak_engagement_times.join(', ')}</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Post <strong>1 hour before</strong> peak platform times</li>
                  <li>• Share stories during <strong>commute hours (7-9am, 5-7pm)</strong></li>
                  <li>• Maintain <strong>1 high-quality post per day</strong></li>
                  <li>• Share <strong>3-5 authentic stories</strong> daily</li>
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Content Format Guidelines
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use <strong>high-quality action shots</strong></li>
                <li>• Create <strong>15-30 second video clips</strong></li>
                <li>• Share <strong>multi-image carousels (3-5 images)</strong></li>
                <li>• Include <strong>raw, unfiltered moments</strong></li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-foreground text-base">Select a celebrity to view AI insights.</p>
        )}
      </CardContent>
    </Card>
  );
};
