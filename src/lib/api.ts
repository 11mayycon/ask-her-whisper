import { localDB } from './local-storage-db';

export const api = {
  // Auth
  async login(email: string, password: string) {
    try {
      const result = await localDB.login(email, password);
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao fazer login');
    }
  },

  async signup(email: string, password: string, full_name: string) {
    try {
      const result = await localDB.createAdmin({
        email,
        password,
        name: full_name,
        role: 'admin'
      });
      const token = btoa(`${result.id}:${Date.now()}`);
      return { user: result, token, role: result.role };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao criar conta');
    }
  },

  async getMe(token: string) {
    try {
      const user = await localDB.getMe(token);
      return user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao buscar usuário');
    }
  },

  // Admin
  async getStats(token: string) {
    try {
      return await localDB.getStats();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao buscar estatísticas');
    }
  },

  async getAdmins(token: string) {
    try {
      return await localDB.getAllAdmins();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao buscar administradores');
    }
  },

  async createAdmin(token: string, data: any) {
    try {
      return await localDB.createAdmin({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'admin',
        cpf: data.cpf
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao criar administrador');
    }
  },

  async deleteAdmin(token: string, id: string) {
    try {
      await localDB.deleteAdmin(id);
      return { success: true };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao deletar administrador');
    }
  },
};
