import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { SplashAd } from "@/components/SplashAd";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cars from "./pages/Cars";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import CarDetail from "./pages/CarDetail";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import AboutUs from "./pages/AboutUs";
import Premium from "./pages/Premium";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if user has already seen the splash in this session
    return !sessionStorage.getItem('splashSeen');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashSeen', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashAd onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/cars/:id" element={<CarDetail />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/create" element={<CreateListing />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/premium" element={<Premium />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
