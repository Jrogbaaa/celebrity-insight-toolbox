import { Card } from "@/components/ui/card";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { InstagramFeatureList } from "@/components/instagram/InstagramFeatureList";
import { InstagramWelcome } from "@/components/instagram/InstagramWelcome";
import { InstagramLoginButton } from "@/components/instagram/InstagramLoginButton";
import { InstagramFooter } from "@/components/instagram/InstagramFooter";

const Login = () => {
  const { isLoading, handleInstagramLogin } = useInstagramAuth();

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <InstagramWelcome />
          <InstagramFeatureList />
          <InstagramLoginButton 
            onClick={handleInstagramLogin}
            isLoading={isLoading}
          />
          <InstagramFooter />
        </div>
      </Card>
    </div>
  );
};

export default Login;