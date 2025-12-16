import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "./ClientSidebar";

interface ClientLayoutProps {
  children: ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ClientSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-4 lg:hidden">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
