
import React from "react";
import { Gift } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CelebrityReport } from "@/types/reports";

interface SponsorOpportunitiesProps {
  selectedReport: CelebrityReport;
}

export const SponsorOpportunities: React.FC<SponsorOpportunitiesProps> = ({ selectedReport }) => {
  const highlightKeyPhrases = (text: string) => {
    const patterns = [
      // Highlight key metrics
      { pattern: /(\d+%(?:\s*increase)?)/g, replacement: '<strong>$1</strong>' },
      // Highlight specific performance indicators
      { pattern: /(high|strong) (engagement|performance|conversion|resonance)/gi, replacement: '<strong>$1 $2</strong>' },
      // Highlight key opportunity phrases
      { pattern: /(perfect match|ideal opportunity|proven success)/gi, replacement: '<strong>$1</strong>' },
      // Highlight specific demographics or markets
      { pattern: /(target audience|key demographic|market segment)/gi, replacement: '<strong>$1</strong>' },
      // Highlight significant results
      { pattern: /(significant|substantial) (growth|increase|improvement)/gi, replacement: '<strong>$1 $2</strong>' },
      // Highlight specific success metrics
      { pattern: /(conversion rates|engagement metrics|ROI)/gi, replacement: '<strong>$1</strong>' }
    ];

    let highlightedText = text;
    patterns.forEach(({ pattern, replacement }) => {
      highlightedText = highlightedText.replace(pattern, replacement);
    });

    return highlightedText;
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Sponsor Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <ul className="list-disc list-inside space-y-2">
              {selectedReport.report_data.sponsor_opportunities?.map((opportunity: string, index: number) => (
                <li 
                  key={index} 
                  className="text-foreground text-base" 
                  dangerouslySetInnerHTML={{
                    __html: highlightKeyPhrases(opportunity)
                  }} 
                />
              ))}
            </ul>
          </div>
          {selectedReport.report_data.brand_mentions && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Recent Brand Mentions</h3>
              <p className="text-foreground text-base">
                {selectedReport.report_data.brand_mentions.join(", ")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
