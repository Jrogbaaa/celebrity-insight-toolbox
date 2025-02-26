
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { useReportsData } from "@/components/analytics/useReportsData";
import { PlatformTabs } from "@/components/analytics/PlatformTabs";
import { UpdateReminder } from "@/components/analytics/UpdateReminder";
import { DemographicsDisplay } from "@/components/analytics/DemographicsDisplay";
import { AIActionItems } from "@/components/analytics/AIActionItems";
import { SponsorOpportunities } from "@/components/analytics/SponsorOpportunities";
import { PostingInsights } from "@/components/analytics/PostingInsights";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MessageCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

const Analytics = () => {
  const { 
    reports, 
    selectedReport, 
    setSelectedReport, 
    fetchReports, 
    loading,
    socialBladeLoading, 
    socialBladeError 
  } = useReportsData();
  
  const queryClient = useQueryClient();

  const getUniquePlatforms = () => {
    if (!selectedReport) return [];
    return [...new Set(reports
      .filter(report => report.celebrity_name === selectedReport.celebrity_name)
      .map(report => report.platform))];
  };

  const platforms = getUniquePlatforms();
  const currentPlatform = selectedReport?.platform || platforms[0];
  
  // Check if Social Blade data is available
  const hasSocialBladeData = selectedReport && 'social_blade_data' in selectedReport && selectedReport.social_blade_data;

  const refreshSocialBladeData = () => {
    if (selectedReport) {
      queryClient.invalidateQueries({
        queryKey: ['socialBlade', selectedReport.username, selectedReport.platform]
      });
    }
  };

  // Format Social Blade data for display
  const renderSocialBladeData = () => {
    if (!hasSocialBladeData) return null;
    
    const data = selectedReport.social_blade_data;
    
    // Fallback if we don't have structured data
    if (!data || typeof data !== 'object') {
      return (
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto max-h-[300px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* SocialBlade Summary - adjust based on actual data structure */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {data.username && (
                <>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Username:</dt>
                  <dd>{data.username}</dd>
                </>
              )}
              {data.followers && (
                <>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Followers:</dt>
                  <dd>{data.followers.toLocaleString()}</dd>
                </>
              )}
              {data.following && (
                <>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Following:</dt>
                  <dd>{data.following.toLocaleString()}</dd>
                </>
              )}
              {data.uploads && (
                <>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Uploads:</dt>
                  <dd>{data.uploads.toLocaleString()}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
        
        {/* Raw data - for development/debugging */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detailed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto max-h-[300px]">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container animate-fade-in relative min-h-screen pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Analytics Hub
        </h1>
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <CelebrityReportSelector reports={reports} selectedReport={selectedReport} onSelectReport={setSelectedReport} />
          </div>
          <div className="flex-shrink-0">
            <CelebrityReportUploader onUploadSuccess={fetchReports} />
          </div>
        </div>
      </div>

      {selectedReport && <div className="mb-8">
          <UpdateReminder selectedReport={selectedReport} />
        </div>}

      {selectedReport && <Alert className="mb-8">
          <AlertDescription className="flex items-center justify-between">
            <div>
              Viewing analytics for {selectedReport.celebrity_name} ({selectedReport.username}) on {selectedReport.platform}
              {hasSocialBladeData && (
                <Badge variant="secondary" className="ml-2">Social Blade Enhanced</Badge>
              )}
            </div>
            {selectedReport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshSocialBladeData}
                disabled={socialBladeLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${socialBladeLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            )}
          </AlertDescription>
        </Alert>}

      {socialBladeError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Could not fetch Social Blade data. Using local analytics only.
          </AlertDescription>
        </Alert>
      )}

      {selectedReport && platforms.length > 0 && <PlatformTabs platforms={platforms} currentPlatform={currentPlatform} reports={reports} selectedReport={selectedReport} setSelectedReport={setSelectedReport} />}

      <div className="space-y-8 mt-8">
        <AIActionItems selectedReport={selectedReport} />
        
        {selectedReport?.report_data.posting_insights && <PostingInsights insights={selectedReport.report_data.posting_insights} />}

        {selectedReport?.report_data.sponsor_opportunities && <SponsorOpportunities selectedReport={selectedReport} />}

        {selectedReport?.report_data.demographics && <DemographicsDisplay demographics={selectedReport.report_data.demographics} />}
        
        {/* Social Blade Data Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
            <span>Social Blade Analytics</span>
            {socialBladeLoading && <Badge variant="outline">Loading...</Badge>}
          </h2>
          
          {socialBladeLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-[180px] w-full" />
              <Skeleton className="h-[180px] w-full md:col-span-2" />
            </div>
          ) : hasSocialBladeData ? (
            renderSocialBladeData()
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {socialBladeError ? (
                <>
                  <p>Unable to load Social Blade data.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshSocialBladeData}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </>
              ) : (
                <p>Select a celebrity to view Social Blade analytics.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat button and dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-8 right-8 shadow-lg rounded-full md:px-6 z-50 w-auto inline-flex items-center" 
            size={undefined}
            variant="default"
          >
            <MessageCircle className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline whitespace-nowrap">My AI Social Expert</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[500px] h-[450px] p-0">
          <ChatContainer selectedReport={selectedReport} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
