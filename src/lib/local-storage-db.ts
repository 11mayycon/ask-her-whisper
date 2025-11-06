// Local Storage Database Service
// Substitui o backend SQLite por um sistema baseado em localStorage

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'admin';
  cpf?: string;
  created_at: string;
}

export interface Stats {
  iaAtendendo: number;
  finalizados: number;
  ultimos15Dias: number;
  agentesOnline: number;
}

class LocalStorageDB {
  private readonly ADMINS_KEY = 'admins';
  private readonly STATS_KEY = 'stats';
  
  constructor() {
    this.initializeDatabase();
  }

  // Inicializa o banco com dados padrão
  private initializeDatabase() {
    if (!localStorage.getItem(this.ADMINS_KEY)) {
      const superAdmin: Admin = {
        id: crypto.randomUUID(),
        email: 'maiconsillva2025@gmail.com',
        password: '1285041', // Em produção, use hash!
        name: 'Super Admin',
        role: 'super_admin',
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem(this.ADMINS_KEY, JSON.stringify([superAdmin]));
      console.log('✅ Super Admin criado:', superAdmin.email);
    }

    if (!localStorage.getItem(this.STATS_KEY)) {
      const initialStats: Stats = {
        iaAtendendo: 0,
        finalizados: 0,
        ultimos15Dias: 0,
        agentesOnline: 0
      };
      localStorage.setItem(this.STATS_KEY, JSON.stringify(initialStats));
    }
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: Admin; token: string; role: string }> {
    const admins = this.getAdmins();
    const admin = admins.find(a => a.email === email && a.password === password);
    
    if (!admin) {
      throw new Error('Email ou senha inválidos');
    }

    const token = btoa(`${admin.id}:${Date.now()}`); // Token simples
    
    return {
      user: admin,
      token,
      role: admin.role
    };
  }

  async getMe(token: string): Promise<Admin> {
    try {
      const decoded = atob(token);
      const [userId] = decoded.split(':');
      
      const admins = this.getAdmins();
      const admin = admins.find(a => a.id === userId);
      
      if (!admin) {
        throw new Error('Usuário não encontrado');
      }
      
      return admin;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Admins
  private getAdmins(): Admin[] {
    const data = localStorage.getItem(this.ADMINS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveAdmins(admins: Admin[]): void {
    localStorage.setItem(this.ADMINS_KEY, JSON.stringify(admins));
  }

  async getAllAdmins(): Promise<Admin[]> {
    return this.getAdmins();
  }

  async createAdmin(data: Omit<Admin, 'id' | 'created_at'>): Promise<Admin> {
    const admins = this.getAdmins();
    
    // Verificar se email já existe
    if (admins.some(a => a.email === data.email)) {
      throw new Error('Email já cadastrado');
    }

    const newAdmin: Admin = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    admins.push(newAdmin);
    this.saveAdmins(admins);
    
    return newAdmin;
  }

  async deleteAdmin(id: string): Promise<void> {
    const admins = this.getAdmins();
    const admin = admins.find(a => a.id === id);
    
    if (!admin) {
      throw new Error('Administrador não encontrado');
    }

    if (admin.role === 'super_admin') {
      throw new Error('Não é possível deletar o Super Admin');
    }

    const filteredAdmins = admins.filter(a => a.id !== id);
    this.saveAdmins(filteredAdmins);
  }

  // Stats
  async getStats(): Promise<Stats> {
    const data = localStorage.getItem(this.STATS_KEY);
    return data ? JSON.parse(data) : {
      iaAtendendo: 0,
      finalizados: 0,
      ultimos15Dias: 0,
      agentesOnline: 0
    };
  }

  async updateStats(stats: Partial<Stats>): Promise<Stats> {
    const currentStats = await this.getStats();
    const updatedStats = { ...currentStats, ...stats };
    localStorage.setItem(this.STATS_KEY, JSON.stringify(updatedStats));
    return updatedStats;
  }

  // Reset database
  resetDatabase(): void {
    localStorage.removeItem(this.ADMINS_KEY);
    localStorage.removeItem(this.STATS_KEY);
    this.initializeDatabase();
    console.log('✅ Banco de dados resetado');
  }
}

export const localDB = new LocalStorageDB();
