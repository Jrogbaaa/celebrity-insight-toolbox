
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CelebrityReport } from "@/types/reports";
import { ReportsService } from "@/services/ReportsService";

export const useReportsData = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<CelebrityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CelebrityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports...');

      const fetchedReports = await ReportsService.fetchReports();

      if (!ReportsService.validateReports(fetchedReports)) {
        console.log('No reports found');
        setReports([]);
        setSelectedReport(null);
        toast({
          title: "No Reports",
          description: "No celebrity reports found.",
          variant: "default",
        });
        return;
      }

      console.log('Fetched data:', fetchedReports);
      setReports(fetchedReports);
      
      if (!selectedReport || !fetchedReports.find(r => r.id === selectedReport.id)) {
        setSelectedReport(fetchedReports[0]);
      }

    } catch (error) {
      console.error('Error in fetchReports:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    selectedReport,
    setSelectedReport,
    fetchReports,
    loading,
  };
};
