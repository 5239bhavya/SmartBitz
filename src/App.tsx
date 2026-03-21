import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import React, { Suspense } from "react";
const Index = React.lazy(() => import("./pages/Index"));
const StartPage = React.lazy(() => import("./pages/StartPage"));
const RecommendationsPage = React.lazy(() => import("./pages/RecommendationsPage"));
const BusinessPlanPage = React.lazy(() => import("./pages/BusinessPlanPage"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const SavedPlansPage = React.lazy(() => import("./pages/SavedPlansPage"));
const MarketplacePage = React.lazy(() => import("./pages/MarketplacePage"));
const SmartBizAgent = React.lazy(() => import("./pages/SmartBizAgent"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const TrackingParametersPage = React.lazy(() => import("./pages/TrackingParametersPage"));
const SignupPage = React.lazy(() => import("./pages/SignupPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const ScoreboardPage = React.lazy(() => import("./pages/ScoreboardPage"));
const CompliancePage = React.lazy(() => import("./pages/CompliancePage"));
const MarketInsightsPage = React.lazy(() => import("./pages/MarketInsightsPage"));
const KhataErpPage = React.lazy(() => import("./pages/KhataErpPage"));
const CommunityPage = React.lazy(() => import("./pages/CommunityPage"));
const CompetitorPage = React.lazy(() => import("./pages/CompetitorPage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const CareersPage = React.lazy(() => import("./pages/CareersPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const SocialMediaDashboard = React.lazy(() => import("./pages/SocialMediaDashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// 5-minute staleTime: avoids refetching data on every page navigation.
// Same data is still fetched — just served from cache when still fresh.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,                  // fail fast on network errors (was 3)
    },
  },
});

const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary border-t-transparent"></div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/start" element={<StartPage />} />
                  <Route
                    path="/recommendations"
                    element={<RecommendationsPage />}
                  />
                  <Route path="/plan" element={<BusinessPlanPage />} />
                  <Route path="/saved-plans" element={<SavedPlansPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/ai-agent" element={<SmartBizAgent />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route
                    path="/tracking-parameters"
                    element={<TrackingParametersPage />}
                  />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/scoreboard" element={<ScoreboardPage />} />
                  <Route path="/compliance" element={<CompliancePage />} />
                  <Route path="/insights" element={<MarketInsightsPage />} />
                  <Route path="/khata" element={<KhataErpPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/competitor" element={<CompetitorPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/social" element={<SocialMediaDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
