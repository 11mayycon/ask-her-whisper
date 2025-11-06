import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminLayout } from "./components/admin/AdminLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SupportLogin from "./pages/SupportLogin";
import AdminLogin from "./pages/AdminLogin";
import Setup from "./pages/Setup";
import Dashboard from "./pages/admin/Dashboard";
import WhatsAppConnection from "./pages/admin/WhatsAppConnection";
import AIMemory from "./pages/admin/AIMemory";
import AIChat from "./pages/admin/AIChat";
import AccountsManagement from "./pages/admin/AccountsManagement";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";
import AIChatSupport from "./pages/support/AIChat";
import SupportChat from "./pages/support/SupportChat";
import TestSupabase from "./pages/TestSupabase";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/", element: <LandingPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/painel", element: <DashboardPage /> },
    { path: "/support-login", element: <SupportLogin /> },
    { path: "/setup", element: <Setup /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: <AdminLayout><Dashboard /></AdminLayout> },
    { path: "/admin/accounts", element: <AdminLayout><AccountsManagement /></AdminLayout> },
    { path: "/admin/whatsapp", element: <AdminLayout><WhatsAppConnection /></AdminLayout> },
    { path: "/admin/ai-memory", element: <AdminLayout><AIMemory /></AdminLayout> },
    { path: "/admin/ai-chat", element: <AdminLayout><AIChat /></AdminLayout> },
    { path: "/admin/reports", element: <AdminLayout><Reports /></AdminLayout> },
    { path: "/admin/settings", element: <AdminLayout><Settings /></AdminLayout> },
    { path: "/support/ai-chat", element: <AIChatSupport /> },
    { path: "/support/chat", element: <SupportChat /> },
    { path: "/test-supabase", element: <TestSupabase /> },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: { v7_startTransition: true, v7_relativeSplatPath: true },
  }
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
