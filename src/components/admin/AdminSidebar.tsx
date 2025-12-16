import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Bot, LayoutDashboard, Users, ClipboardList, Brain, Smartphone,
  Package, BarChart3, ScrollText, Settings, LogOut, Moon, Sun
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Clientes", path: "/admin/clients" },
  { icon: ClipboardList, label: "Solicitações", path: "/admin/requests" },
  { icon: Brain, label: "Config. IA", path: "/admin/ai-config" },
  { icon: Smartphone, label: "WhatsApp", path: "/admin/whatsapp" },
  { icon: Package, label: "Planos", path: "/admin/plans" },
  { icon: BarChart3, label: "Relatórios", path: "/admin/reports" },
  { icon: ScrollText, label: "Logs", path: "/admin/logs" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { open } = useSidebar();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {open && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">ISA Admin</h1>
              <p className="text-xs text-muted-foreground truncate">Painel Administrativo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <NavLink to={item.path}>
                        <Icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")} tooltip="Tema">
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>Tema {theme === "dark" ? "Claro" : "Escuro"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.email?.[0].toUpperCase() || "A"}
              </div>
              {open && <p className="text-xs text-muted-foreground truncate">{user?.email}</p>}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
