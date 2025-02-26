
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, UserPlus } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReportData, saveReportToDatabase } from "@/utils/reportUpload";
import { useToast } from "@/hooks/use-toast";

export const CelebrityReportUploader = ({ onUploadSuccess }: { onUploadSuccess: () => Promise<void> }) => {
  const { loading, fileInputRef, handleFileSelect } = useFileUpload(onUploadSuccess);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualEntryLoading, setManualEntryLoading] = useState(false);
  const { toast } = useToast();

  // State for manual entry form
  const [celebrityName, setCelebrityName] = useState("");
  const [followers, setFollowers] = useState("");
  const [following, setFollowing] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [avgLikes, setAvgLikes] = useState("");
  const [avgComments, setAvgComments] = useState("");
  const [platform, setPlatform] = useState("Instagram");

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!celebrityName) {
      toast({
        title: "Missing Information",
        description: "Celebrity name is required",
        variant: "destructive",
      });
      return;
    }

    setManualEntryLoading(true);
    try {
      // Create a dummy file for storage reference (not actually used)
      const dummyFile = new File([""], `${celebrityName.replace(/\s/g, "_")}.pdf`, { type: "application/pdf" });
      
      // Generate a timestamp for the URL
      const timestamp = new Date().getTime();
      const dummyUrl = `manual_entry_${timestamp}_${celebrityName.replace(/\s/g, "_")}`;
      
      // Create report data structure
      const reportData = {
        celebrity_name: celebrityName,
        username: celebrityName.toLowerCase().replace(/\s/g, ""),
        platform: platform,
        report_data: {
          pdf_url: dummyUrl,
          followers: {
            total: parseInt(followers) || 0
          },
          following: {
            total: parseInt(following) || 0
          },
          media_uploads: {
            total: Math.floor((parseInt(followers) || 10000) / 1000) + 50
          },
          engagement: {
            rate: engagementRate || "0",
            average_likes: parseInt(avgLikes) || 0,
            average_comments: parseInt(avgComments) || 0,
            average_shares: Math.floor((parseInt(avgLikes) || 100) * 0.01)
          },
          posting_insights: {
            peak_engagement_times: ["12:00 PM ET", "5:00 PM ET", "8:00 PM ET"],
            posting_tips: [
              `Best time for branded posts is 5:00 PM ET`,
              `Content performs best during afternoon and evening hours`,
              `Engagement is highest with lifestyle and personal content`,
              `Strong performance in local market`,
              `Engagement rate of ${engagementRate || "0"}% indicates good audience connection`
            ],
            demographic_data: {
              top_locations: ["Madrid, ES", "Barcelona, ES", "New York, US", "London, UK", "Mexico City, MX"],
              gender_split: {
                female: 55,
                male: 45
              },
              age_ranges: {
                "18-24": 25,
                "25-34": 40,
                "35-44": 20,
                "45-54": 10,
                "55+": 5
              }
            },
            sponsored_content: {
              recent_brands: [
                "Fashion Brand",
                "Beauty Products",
                "Fitness Company",
                "Food & Beverage"
              ]
            }
          },
          demographics: {
            age_groups: {
              "18-24": "25%",
              "25-34": "40%",
              "35-44": "20%",
              "45-54": "10%",
              "55+": "5%"
            },
            gender: {
              "Female": "55%",
              "Male": "45%"
            },
            top_locations: ["Madrid, ES", "Barcelona, ES", "New York, US", "London, UK", "Mexico City, MX"]
          },
          sponsor_opportunities: [
            "Fashion Collaborations",
            "Beauty Product Endorsements",
            "Fitness Partnerships",
            "Lifestyle Brand Ambassadorships",
            "Travel Sponsorships",
            "Food & Beverage Promotions"
          ]
        },
        report_date: new Date().toISOString().split('T')[0]
      };

      await saveReportToDatabase(reportData);
      
      toast({
        title: "Success",
        description: `Created profile for ${celebrityName}`,
      });
      
      // Reset form
      setCelebrityName("");
      setFollowers("");
      setFollowing("");
      setEngagementRate("");
      setAvgLikes("");
      setAvgComments("");
      setPlatform("Instagram");
      
      // Close dialog and refresh reports
      setIsDialogOpen(false);
      await onUploadSuccess();
      
    } catch (error) {
      console.error("Error creating manual entry:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setManualEntryLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
      />
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all h-9 sm:h-10 px-3 sm:px-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Data
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="max-w-xs">Upload a PDF file to create a new celebrity profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Manual Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Celebrity Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celebrityName">Celebrity Name</Label>
                  <Input
                    id="celebrityName"
                    value={celebrityName}
                    onChange={(e) => setCelebrityName(e.target.value)}
                    placeholder="Enter celebrity name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Youtube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="followers">Followers</Label>
                    <Input 
                      id="followers"
                      type="number"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      placeholder="10000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="following">Following</Label>
                    <Input 
                      id="following"
                      type="number"
                      value={following}
                      onChange={(e) => setFollowing(e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
                    <Input 
                      id="engagementRate"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                      placeholder="2.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avgLikes">Avg. Likes</Label>
                    <Input 
                      id="avgLikes"
                      type="number"
                      value={avgLikes}
                      onChange={(e) => setAvgLikes(e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avgComments">Avg. Comments</Label>
                    <Input 
                      id="avgComments"
                      type="number"
                      value={avgComments}
                      onChange={(e) => setAvgComments(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  disabled={manualEntryLoading}
                >
                  {manualEntryLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : "Create Profile"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
