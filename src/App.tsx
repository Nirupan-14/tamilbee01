import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import UserDashboard from "@/pages/user/UserDashboard";
import UserEvents from "@/pages/user/UserEvents";
import UserBusiness from "@/pages/user/UserBusiness";
import Subscription from "@/pages/user/Subscription";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EventModeration from "@/pages/admin/EventModeration";
import UserManagement from "@/pages/admin/UserManagement";
import TermsConditions from "@/pages/TermsConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/NotFound";
import AdminBusinessManagement from "./pages/admin/AdminBusinessManagement";
import AdminPaymentManagement from "./pages/admin/AdminPaymentManagement";
import AdminSubscriptionManagement from "./pages/admin/AdminSubscriptionManagement";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* User Dashboard */}
              <Route path="/dashboard/user" element={<DashboardLayout><UserDashboard /></DashboardLayout>} />
              <Route path="/dashboard/user/events" element={<DashboardLayout><UserEvents /></DashboardLayout>} />
              <Route path="/dashboard/user/business" element={<DashboardLayout><UserBusiness /></DashboardLayout>} />
              <Route path="/dashboard/user/subscription" element={<DashboardLayout><Subscription /></DashboardLayout>} />

              {/* Admin Dashboard */}
              <Route path="/dashboard/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
              <Route path="/dashboard/admin/moderation" element={<DashboardLayout><EventModeration /></DashboardLayout>} />
              <Route path="/dashboard/admin/users" element={<DashboardLayout><UserManagement /></DashboardLayout>} />
              <Route path="/dashboard/admin/business" element={<DashboardLayout><AdminBusinessManagement /></DashboardLayout>} />
              <Route path="/dashboard/admin/payments" element={<DashboardLayout><AdminPaymentManagement /></DashboardLayout>} />
              <Route path="/dashboard/admin/subscriptions" element={<DashboardLayout><AdminSubscriptionManagement /></DashboardLayout>} />
              <Route path="/dashboard/admin/settings" element={<DashboardLayout><AdminSettings /></DashboardLayout>} />



              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
