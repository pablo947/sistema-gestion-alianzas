import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Actors from "./pages/Actors";
import Contacts from "./pages/Contacts";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Grafos from "./pages/Grafos";
import NotFound from "./pages/NotFound";
import Administration from "./pages/Administration";
import ResetPassword from "./pages/ResetPassword";
import Strategies from "./pages/Strategies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<AuthGuard><Layout><Index /></Layout></AuthGuard>} />
            <Route path="/actors" element={<AuthGuard><Layout><Actors /></Layout></AuthGuard>} />
            <Route path="/contacts" element={<AuthGuard><Layout><Contacts /></Layout></AuthGuard>} />
            <Route path="/projects" element={<AuthGuard><Layout><Projects /></Layout></AuthGuard>} />
            <Route path="/team" element={<AuthGuard><Layout><Team /></Layout></AuthGuard>} />
            <Route path="/reports" element={<AuthGuard><Layout><Reports /></Layout></AuthGuard>} />
            <Route path="/grafos" element={<AuthGuard><Layout><Grafos /></Layout></AuthGuard>} />
            <Route path="/strategies" element={<AuthGuard><Layout><Strategies /></Layout></AuthGuard>} />
            <Route path="/admin" element={<AdminRoute><Layout><Administration /></Layout></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
