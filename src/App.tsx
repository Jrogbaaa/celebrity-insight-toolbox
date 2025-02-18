
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Analytics from "./pages/Analytics";
import Generation from "./pages/Generation";
import TermsOfService from "./pages/TermsOfService";
import TikTokCallback from "./pages/TikTokCallback";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return <div className="min-h-screen bg-background">
      <div className="container py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/b6e1b30d-e5da-4a7c-a805-2e76a622356b.png" 
                alt="Look After You" 
                className="h-10 object-contain" 
              />
              <h1 className="text-xl font-semibold text-primary">Talent AI</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/analytics">Analytics Hub</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/generation">AI Content Expert</Link>
            </Button>
          </div>
        </div>
        {children}
      </div>
    </div>;
};

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Analytics /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/generation" element={<Layout><Generation /></Layout>} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/tiktok-callback" element={<TikTokCallback />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
