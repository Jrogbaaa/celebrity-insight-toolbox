import { Card } from "@/components/ui/card";

const Login = () => {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Welcome</h1>
          <p className="text-muted-foreground mb-8">
            Get started with AI-powered content insights
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;