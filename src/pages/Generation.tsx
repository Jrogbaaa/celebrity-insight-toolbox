import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Card } from "@/components/ui/card";

const Generation = () => {
  const { isAuthChecking } = useAuthRedirect();

  if (isAuthChecking) {
    return (
      <div className="container max-w-4xl py-2">
        <Card className="h-[calc(100vh-6rem)] shadow-lg flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-2">
      <h1 className="text-xl font-bold mb-2 text-primary">AI Content Expert</h1>
      <ChatContainer />
    </div>
  );
};

export default Generation;