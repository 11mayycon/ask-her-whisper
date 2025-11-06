import { API_URL, fetchWithAuth } from './api-config';

// Cliente para comunicação com o backend
class DatabaseClient {
  // Métodos para atendimentos
  async getAttendances() {
    const response = await fetchWithAuth(`${API_URL}/attendances`);
    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao buscar atendimentos:', error);
      throw new Error(error.message || 'Erro ao buscar atendimentos');
    }
    return await response.json();
  }

  async getAttendanceMessages(attendanceId: string) {
    // a ser implementado
  }

  async sendAttendanceMessage(attendanceId: string, message: string) {
    // a ser implementado
  }

  // Métodos para IA
  async sendAIMessage(message: string, context?: any) {
    // a ser implementado
  }

  // Métodos para autenticação (deprecated - use AuthContext)
  async login(email: string, password: string) {
    // Deprecated - usar AuthContext
    console.warn('DatabaseClient.login is deprecated, use AuthContext instead');
    return null;
  }

  async logout() {
    // Deprecated - usar AuthContext
    console.warn('DatabaseClient.logout is deprecated, use AuthContext instead');
  }

  // Métodos para usuários de suporte
  async getSupportUsers() {
    const response = await fetchWithAuth(`${API_URL}/support/users`);
    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao buscar usuários de suporte:', error);
      throw new Error(error.message || 'Erro ao buscar usuários de suporte');
    }
    return await response.json();
  }

  // Método para simular real-time (substitui o Supabase channels)
  subscribeToMessages(callback: (message: any) => void) {
    // Por enquanto, implementação simples com polling
    // Em produção, você pode usar WebSockets ou Server-Sent Events
    const interval = setInterval(async () => {
      try {
        // Implementar lógica de polling se necessário
      } catch (error) {
        console.error('Erro no polling de mensagens:', error);
      }
    }, 5000);

    return {
      unsubscribe: () => clearInterval(interval)
    };
  }
}

export const databaseClient = new DatabaseClient();