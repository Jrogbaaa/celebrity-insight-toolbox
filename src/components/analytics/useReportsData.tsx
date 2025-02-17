
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

      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Authentication error: ' + sessionError.message);
      }

      // If no session, show a message
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view celebrity reports.",
          variant: "destructive",
        });
        setReports([]);
        setSelectedReport(null);
        return;
      }

      // Fetch reports with proper error handling
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

      console.log('Fetched data:', data);
      setReports(data);
      
      // Only set selected report if none is currently selected
      if (!selectedReport && data.length > 0) {
        setSelectedReport(data[0]);
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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setReports([]);
        setSelectedReport(null);
      } else {
        fetchReports();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    reports,
    selectedReport,
    setSelectedReport,
    fetchReports,
    loading,
  };
};
