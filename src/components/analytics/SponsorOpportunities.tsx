
import React from "react";
import { Gift } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CelebrityReport } from "@/types/reports";

interface SponsorOpportunitiesProps {
  selectedReport: CelebrityReport;
}

export const SponsorOpportunities: React.FC<SponsorOpportunitiesProps> = ({ selectedReport }) => {
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
                <li key={index} className="text-foreground text-base" dangerouslySetInnerHTML={{
                  __html: opportunity.replace(/(brand deals|collaborations|sponsorships|partnerships|engagement rates|reach|ROI|conversion rates)/gi, '<strong>$1</strong>')
                }} />
              ))}
            </ul>
          </div>
          {selectedReport.report_data.brand_mentions && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Recent Brand Mentions</h3>
              <p className="text-foreground text-base mt-2">
                <strong>{selectedReport.report_data.brand_mentions.join('</strong>, <strong>')}</strong>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
