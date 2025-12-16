import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminLayout } from "./components/admin/AdminLayout";
import LandingPage from "./pages/LandingPage";
import EntrySelection from "./pages/EntrySelection";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";
import ClientLogin from "./pages/client/ClientLogin";
import ClientRegister from "./pages/client/ClientRegister";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientWhatsApp from "./pages/client/ClientWhatsApp";
import ClientAIMemory from "./pages/client/ClientAIMemory";
import ClientSettings from "./pages/client/ClientSettings";
import { ClientLayout } from "./components/client/ClientLayout";
import AdminClients from "./pages/admin/AdminClients";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminAIConfig from "./pages/admin/AdminAIConfig";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/", element: <LandingPage /> },
    { path: "/entrar", element: <EntrySelection /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: <AdminLayout><Dashboard /></AdminLayout> },
    { path: "/admin/clients", element: <AdminLayout><AdminClients /></AdminLayout> },
    { path: "/admin/requests", element: <AdminLayout><AdminRequests /></AdminLayout> },
    { path: "/admin/ai-config", element: <AdminLayout><AdminAIConfig /></AdminLayout> },
    { path: "/admin/settings", element: <AdminLayout><Settings /></AdminLayout> },
    { path: "/client/login", element: <ClientLogin /> },
    { path: "/client/register", element: <ClientRegister /> },
    { path: "/client/dashboard", element: <ClientLayout><ClientDashboard /></ClientLayout> },
    { path: "/client/whatsapp", element: <ClientLayout><ClientWhatsApp /></ClientLayout> },
    { path: "/client/ai-memory", element: <ClientLayout><ClientAIMemory /></ClientLayout> },
    { path: "/client/settings", element: <ClientLayout><ClientSettings /></ClientLayout> },
    { path: "/support-login", element: <EntrySelection /> },
    { path: "*", element: <LandingPage /> },
  ],
  {
    future: { v7_relativeSplatPath: true },
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
