import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NodesPage from "./pages/NodesPage";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import AboutUs from "./pages/AboutUs";
import RateUs from "./pages/RateUs";
import AboutProject from "./pages/AboutProject";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pods" element={<Index />} />
          
          {/* Routes with DashboardLayout */}
          <Route path="/nodes" element={
            <DashboardLayout>
              <NodesPage />
            </DashboardLayout>
          } />
          <Route path="/analytics" element={
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          } />
          <Route path="/about" element={
            <DashboardLayout>
              <AboutUs />
            </DashboardLayout>
          } />
          <Route path="/rate" element={
            <DashboardLayout>
              <RateUs />
            </DashboardLayout>
          } />
          
          {/* About-project with DashboardLayout */}
          <Route path="/about-project" element={
            <DashboardLayout>
              <AboutProject />
            </DashboardLayout>
          }>
            <Route index element={<Navigate to="flow-diagram" replace />} />
            <Route path=":subpage" element={<AboutProject />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
