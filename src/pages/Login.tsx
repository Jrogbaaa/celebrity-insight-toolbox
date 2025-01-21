import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

const Login = () => {
  const handleConnectInstagram = () => {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${window.location.origin}/instagram-callback`;
    const scope = 'instagram_basic,instagram_content_publish';
    
    const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = instagramUrl;
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <Instagram className="mx-auto h-12 w-12 mb-4 text-pink-500" />
          <h1 className="text-2xl font-bold mb-4">Welcome to Instagram Analytics</h1>
          <p className="text-muted-foreground mb-8">
            Connect your Instagram Business account to view detailed analytics and insights about your profile.
          </p>
          <Button 
            onClick={handleConnectInstagram}
            className="gap-2"
          >
            <Instagram className="h-5 w-5" />
            Continue with Instagram
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;