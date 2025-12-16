import { 
  LayoutDashboard, Smartphone, Brain, Settings, LogOut, Bot, 
  ChevronLeft
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/client/dashboard" },
  { icon: Smartphone, label: "WhatsApp", path: "/client/whatsapp" },
  { icon: Brain, label: "Memória da IA", path: "/client/ai-memory" },
  { icon: Settings, label: "Configurações", path: "/client/settings" },
];

export const ClientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-foreground">ISA</span>
              <p className="text-xs text-muted-foreground">Área do Cliente</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  isActive={isActive}
                  tooltip={item.label}
                  className={`w-full justify-start gap-3 h-11 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && <span>Recolher</span>}
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
