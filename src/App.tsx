import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import EventsPage from "./pages/Events";
import LostFoundPage from "./pages/LostFound";
import StudyGroupsPage from "./pages/StudyGroups";
import QAPage from "./pages/QA";
import StudyPlannerPage from "./pages/StudyPlanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/lost-found" element={<LostFoundPage />} />
          <Route path="/study-groups" element={<StudyGroupsPage />} />
          <Route path="/qa" element={<QAPage />} />
          <Route path="/planner" element={<StudyPlannerPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
