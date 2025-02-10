
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import Generation from "./pages/Generation";
import TermsOfService from "./pages/TermsOfService";
import TikTokCallback from "./pages/TikTokCallback";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background pb-14">
      {children}
      <Navigation />
    </div>
  );
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
            <Route path="/" element={<Layout><Navigate to="/recommendations" replace /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
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
