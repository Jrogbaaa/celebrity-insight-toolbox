
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

      const { data, error } = await supabase
        .from('celebrity_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        console.log('No reports found');
        setReports([]);
        setSelectedReport(null);
        toast({
          title: "No Reports",
          description: "No celebrity reports found. Try uploading one!",
          variant: "default",
        });
        return;
      }

      // Group reports by celebrity name
      const groupedReports = data.reduce((acc: CelebrityReport[], report) => {
        const existingReport = acc.find(r => r.celebrity_name === report.celebrity_name);
        if (!existingReport) {
          acc.push(report);
        }
        return acc;
      }, []);

      console.log('Fetched and grouped data:', groupedReports);
      setReports(groupedReports);
      
      if (!selectedReport && groupedReports.length > 0) {
        setSelectedReport(groupedReports[0]);
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
