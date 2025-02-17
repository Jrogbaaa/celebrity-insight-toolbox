
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CelebrityReport {
  id: string;
  celebrity_name: string;
  username: string;
  platform: string;
  report_data: any;
  report_date: string;
}

export const useReportsData = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<CelebrityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CelebrityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports...');

      // Instead of fetching from Supabase, we'll use the static data
      // You'll need to replace this array with the actual static data from the PDFs
      const staticReports = [
        // Add your static report data here
      ];

      if (staticReports.length === 0) {
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

      console.log('Fetched data:', staticReports);
      setReports(staticReports);
      
      if (!selectedReport || !staticReports.find(r => r.id === selectedReport.id)) {
        setSelectedReport(staticReports[0]);
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
