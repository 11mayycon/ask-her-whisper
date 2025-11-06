import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminLayout } from "./components/admin/AdminLayout";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/", element: <LandingPage /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: <AdminLayout><Dashboard /></AdminLayout> },
    { path: "/admin/settings", element: <AdminLayout><Settings /></AdminLayout> },
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
