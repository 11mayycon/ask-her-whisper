import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  userRole: "admin" | "support" | "super_admin" | null;
  signIn: (email: string, password: string) => Promise<{ role: "admin" | "support" | "super_admin" | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "support" | "super_admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Buscar roles do usuário priorizando super_admin > admin > support
      let role: AuthContextType["userRole"] = null;
      try {
        const { data: rolesData } = await supabase
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', session.user.id);
        const roles = (rolesData as any[])?.map(r => r.role) ?? [];
        role = roles.includes('super_admin')
          ? 'super_admin'
          : roles.includes('admin')
          ? 'admin'
          : roles.includes('support')
          ? 'support'
          : null;
      } catch {}


      setUser({ id: session.user.id, email: session.user.email || '', full_name: session.user.user_metadata?.full_name || '' });
      setUserRole(role);
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Buscar role do usuário priorizando super_admin > admin > support
      let role: AuthContextType["userRole"] = null;
      try {
        const { data: rolesData } = await supabase
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', data.user?.id);
        const roles = (rolesData as any[])?.map(r => r.role) ?? [];
        role = roles.includes('super_admin')
          ? 'super_admin'
          : roles.includes('admin')
          ? 'admin'
          : roles.includes('support')
          ? 'support'
          : null;
      } catch {}


      setUser({ id: data.user!.id, email: data.user!.email || '', full_name: data.user!.user_metadata?.full_name || '' });
      setUserRole(role);

      return { role };
    } catch (error: any) {
      console.error('💥 Erro ao fazer login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
