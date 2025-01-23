import { Instagram } from "lucide-react";

export const InstagramWelcome = () => {
  return (
    <>
      <Instagram className="mx-auto h-12 w-12 mb-4 text-pink-500" />
      <h1 className="text-2xl font-bold mb-4">Welcome to Instagram Analytics</h1>
      <p className="text-muted-foreground mb-6">
        Connect your Instagram Business account to:
      </p>
    </>
  );
};