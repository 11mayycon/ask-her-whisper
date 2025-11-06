import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem('auth_token');
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setUserRole(data.role);
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando fazer login...', { email, API_URL });

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Resposta recebida:', response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro ao fazer login' }));
        console.error('❌ Erro na resposta:', error);
        throw new Error(error.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      console.log('✅ Login bem-sucedido!', { role: data.role });

      // Salvar token
      localStorage.setItem('auth_token', data.token);

      // Atualizar estado
      setUser(data.user);
      setUserRole(data.role);

      // Navegar baseado na role
      if (data.role === "admin" || data.role === "super_admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.role === "support") {
        navigate("/support/select-room", { replace: true });
      } else {
        throw new Error("Usuário sem permissões adequadas");
      }
    } catch (error: any) {
      console.error('💥 Erro ao fazer login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
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
