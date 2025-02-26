
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Instagram } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { InstagramService } from '@/services/InstagramService';

export const InstagramScrapeTest = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!username) {
      toast({
        title: "Username required",
        description: "Please enter an Instagram username to test",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      toast({
        title: "Fetching data",
        description: `Scraping Instagram data for @${username}...`,
      });

      const data = await InstagramService.getInstagramProfile(username);
      console.log('Instagram API response:', data);
      setResult(data);

      toast({
        title: "Success",
        description: "Instagram data retrieved successfully",
      });
    } catch (error) {
      console.error('Error testing Instagram scraper:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch Instagram data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          Instagram Scraper Test
        </CardTitle>
        <CardDescription>
          Test the Instagram scraping API by entering a username
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Instagram username (without @)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button 
              onClick={handleTest} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test API
            </Button>
          </div>

          {result && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                {result.profilePicture && (
                  <img 
                    src={result.profilePicture} 
                    alt={result.username} 
                    className="h-16 w-16 rounded-full object-cover border-2 border-pink-300"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-xl">{result.fullName || result.username}</h3>
                  <p className="text-muted-foreground">@{result.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center mt-3">
                <div className="rounded bg-pink-50 p-3">
                  <div className="text-xl font-semibold">{result.followers?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="rounded bg-purple-50 p-3">
                  <div className="text-xl font-semibold">{result.following?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                <div className="rounded bg-blue-50 p-3">
                  <div className="text-xl font-semibold">{result.posts?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-medium">Engagement Rate</h4>
                <p className="text-lg font-semibold">{result.engagementRate}%</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium">Bio</h4>
                <p className="text-sm whitespace-pre-line">{result.biography || "No bio available"}</p>
              </div>
              
              {result.recentPosts?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recent Posts</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {result.recentPosts.slice(0, 6).map((post: any, index: number) => (
                      <div key={index} className="relative group">
                        <img 
                          src={post.thumbnail} 
                          alt={`Post ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 flex justify-between">
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                <details>
                  <summary className="cursor-pointer">View raw JSON response</summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
