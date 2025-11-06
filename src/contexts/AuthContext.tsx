import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  userRole: "admin" | "support" | "super_admin" | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API não é mais usada para autenticação; usamos Supabase diretamente
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "support" | "super_admin" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      // Buscar roles do usuário (com fallback silencioso)
      let role: AuthContextType["userRole"] = null;
      try {
        const { data: roles } = await supabase
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        role = (roles as any)?.role ?? null;
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

      // Buscar role do usuário
      let role: AuthContextType["userRole"] = null;
      try {
        const { data: roles } = await supabase
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', data.user?.id)
          .maybeSingle();
        role = (roles as any)?.role ?? null;
      } catch {}

      setUser({ id: data.user!.id, email: data.user!.email || '', full_name: data.user!.user_metadata?.full_name || '' });
      setUserRole(role);

      if (role === "admin" || role === "super_admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "support") {
        navigate("/support/select-room", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error('💥 Erro ao fazer login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    navigate("/");
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
