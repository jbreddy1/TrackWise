import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { getUser } from "./lib/storage";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getUser();
    setIsAuthenticated(!!user);
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/auth" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/expenses" 
              element={isAuthenticated ? <Expenses /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/budget" 
              element={isAuthenticated ? <Budget /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/analytics" 
              element={isAuthenticated ? <Analytics /> : <Navigate to="/auth" />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
