import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              The Social Tool
            </span>
          </a>
        </div>
        <Tabs
          value={location.pathname}
          className="w-full"
          onValueChange={(value) => navigate(value)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="/analytics">Analytics</TabsTrigger>
            <TabsTrigger value="/recommendations">AI Insights</TabsTrigger>
            <TabsTrigger value="/generation">Create Content</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};