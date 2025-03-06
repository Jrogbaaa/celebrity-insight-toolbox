import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Analytics from "./pages/Analytics";
import Generation from "./pages/Generation";
import TermsOfService from "./pages/TermsOfService";
import TikTokCallback from "./pages/TikTokCallback";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, ArrowRight } from "lucide-react";
import AnimatedLines from "./components/AnimatedLines";

const Layout = ({
  children,
  showAnimatedBackground = false
}: {
  children: React.ReactNode;
  showAnimatedBackground?: boolean;
}) => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {showAnimatedBackground && <AnimatedLines />}
      
      {/* Mobile Header - Fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="container p-0">
          <div className="flex items-center justify-between px-2 py-2">
            <Link to="/" className="flex-1 flex items-center">
              <img src="/lovable-uploads/e7bef072-8d1a-4444-a41f-6dca6ff42c63.png" alt="Look After You" className="h-20 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-2 justify-center flex-shrink-0">
              <Button variant={location.pathname === "/analytics" ? "default" : "ghost"} size="icon" className="w-10 h-10" asChild>
                <Link to="/analytics">
                  <FileText className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant={location.pathname === "/generation" ? "default" : "ghost"} size="icon" className="w-10 h-10" asChild>
                <Link to="/generation">
                  <Pencil className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <Link to="/">
              <img src="/lovable-uploads/e7bef072-8d1a-4444-a41f-6dca6ff42c63.png" alt="Look After You" className="h-40 w-auto object-contain transition-all duration-300 hover:scale-105 cursor-pointer" />
            </Link>
            <div className="flex gap-4">
              <Button variant={location.pathname === "/analytics" ? "default" : "outline"} size="lg" className="shadow-md hover:shadow-lg transition-all duration-300" asChild>
                <Link to="/analytics" className="flex items-center gap-2">
                  My Analytics Hub
                </Link>
              </Button>
              <Button variant={location.pathname === "/generation" ? "default" : "outline"} size="lg" className="shadow-md hover:shadow-lg transition-all duration-300" asChild>
                <Link to="/generation" className="flex items-center gap-2">
                  Creative Studio AI
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with mobile padding for fixed header */}
      <div className="container md:py-4 mt-[88px] md:mt-0 px-0 md:px-4">
        {children}
      </div>
    </div>
  );
};

const WelcomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in px-4 md:px-0 relative z-10">
    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 text-center leading-tight">
      Social Media <br className="md:hidden" />Command Center
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground mb-10 text-center max-w-2xl px-2">
      Analyze your social media performance, generate AI-powered content, and get personalized recommendations to grow your audience.
    </p>
    <Button size="lg" className="shadow-lg hover:shadow-xl transition-all group gap-2 text-base px-8 py-6" asChild>
      <Link to="/analytics">
        Elevate Your Brand
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </Button>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout showAnimatedBackground={true}><WelcomePage /></Layout>} />
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
