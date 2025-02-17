
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Tabs
          value={location.pathname}
          className="w-full"
          onValueChange={(value) => navigate(value)}
        >
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="/analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
