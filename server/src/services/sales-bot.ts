import axios from 'axios';
import { getDatabase } from '../config/sqlite';

// Configuração OpenRouter AI
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMemory {
  conversationSummary?: string;
  keyFacts: string[];
  lastTopics: string[];
  userPreferences: Record<string, any>;
}

interface Lead {
  phone: string;
  name?: string;
  conversationHistory: ConversationMessage[];
  memory: ChatMemory; // Memória específica do chat
  data: Record<string, any>; // Dados flexíveis do lead
  lastMessageAt: Date;
  createdAt: Date;
}

export class SalesBotService {
  private leads: Map<string, Lead> = new Map();
  private aiMemory: string = '';

  // Carregar leads e memória ao iniciar
  async initialize() {
    await this.loadAIMemory();
    await this.loadLeads();
    console.log('🤖 ISA Atendente ativada!');
  }

  // Carregar memória da IA do banco
  private async loadAIMemory() {
    try {
      const db = await getDatabase();
      const memory = await db.get(
        "SELECT value FROM ai_memory WHERE key = 'instructions' LIMIT 1"
      );

      if (memory?.value) {
        this.aiMemory = memory.value;
        console.log('✅ Memória da IA carregada da base de dados');
      } else {
        this.aiMemory = this.getDefaultMemory();
        console.log('ℹ️ Usando memória padrão da ISA');
      }
    } catch (error) {
      console.error('Erro ao carregar memória da IA:', error);
      this.aiMemory = this.getDefaultMemory();
    }
  }

  // Memória padrão da ISA
  private getDefaultMemory(): string {
    return `Você é a ISA (InovaPro AI Sales Assistant), uma atendente virtual inteligente e flexível.

PERSONALIDADE:
- Natural, empática e carismática
- Profissional mas descontraída
- Prestativa e solucionadora
- Adapta-se ao contexto da conversa

TOM DE VOZ:
- Respostas curtas e objetivas (máx 3-4 frases)
- Linguagem coloquial brasileira
- Emojis estratégicos
- Evite textos longos

CAPACIDADES:
- Atender dúvidas gerais
- Auxiliar com suporte
- Realizar vendas quando apropriado
- Coletar informações quando necessário
- Transferir para humano quando solicitado

IMPORTANTE:
- Sempre leia e siga as instruções da memória personalizada
- Adapte-se ao que o administrador configurou
- Seja flexível e contextual`;
  }

  // Carregar leads do banco
  private async loadLeads() {
    try {
      const db = await getDatabase();
      const savedLeads = await db.all(
        'SELECT * FROM sales_leads WHERE last_message_at > datetime("now", "-7 days")'
      );

      for (const lead of savedLeads) {
        // Carregar memória do chat
        const chatMemory = await this.loadChatMemory(lead.phone);

        this.leads.set(lead.phone, {
          phone: lead.phone,
          name: lead.name,
          conversationHistory: [],
          memory: chatMemory,
          data: {
            businessType: lead.business_type,
            currentSystem: lead.current_system,
            stage: lead.stage,
            email: lead.email,
          },
          lastMessageAt: new Date(lead.last_message_at),
          createdAt: new Date(lead.created_at || lead.last_message_at),
        });
      }

      console.log(`✅ ${this.leads.size} conversas carregadas`);
    } catch (error) {
      console.log('ℹ️ Nenhuma conversa anterior encontrada');
    }
  }

  // Carregar memória do chat
  private async loadChatMemory(phone: string): Promise<ChatMemory> {
    try {
      const db = await getDatabase();
      const memory = await db.get(
        'SELECT * FROM chat_memory WHERE phone = ? LIMIT 1',
        [phone]
      );

      if (memory) {
        return {
          conversationSummary: memory.conversation_summary,
          keyFacts: memory.key_facts ? JSON.parse(memory.key_facts) : [],
          lastTopics: memory.last_topics ? JSON.parse(memory.last_topics) : [],
          userPreferences: memory.user_preferences ? JSON.parse(memory.user_preferences) : {},
        };
      }
    } catch (error) {
      console.error('Erro ao carregar memória do chat:', error);
    }

    return {
      keyFacts: [],
      lastTopics: [],
      userPreferences: {},
    };
  }

  // Salvar memória do chat
  private async saveChatMemory(lead: Lead) {
    try {
      const db = await getDatabase();

      await db.run(
        `INSERT OR REPLACE INTO chat_memory
         (id, phone, conversation_summary, key_facts, last_topics, user_preferences, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `mem_${lead.phone}`,
          lead.phone,
          lead.memory.conversationSummary || null,
          JSON.stringify(lead.memory.keyFacts),
          JSON.stringify(lead.memory.lastTopics),
          JSON.stringify(lead.memory.userPreferences),
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar memória do chat:', error);
    }
  }

  // Obter ou criar lead
  private async getOrCreateLead(phone: string): Promise<Lead> {
    if (!this.leads.has(phone)) {
      // Carregar memória existente ou criar nova
      const chatMemory = await this.loadChatMemory(phone);

      const lead: Lead = {
        phone,
        conversationHistory: [],
        memory: chatMemory,
        data: {},
        lastMessageAt: new Date(),
        createdAt: new Date(),
      };
      this.leads.set(phone, lead);
      await this.saveLead(lead);
    }

    const lead = this.leads.get(phone)!;
    lead.lastMessageAt = new Date();
    return lead;
  }

  // Salvar lead no banco
  private async saveLead(lead: Lead) {
    try {
      const db = await getDatabase();
      await db.run(
        `INSERT OR REPLACE INTO sales_leads
         (phone, name, business_type, current_system, stage, last_message_at, test_sent_at, email, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lead.phone,
          lead.name || null,
          lead.data.businessType || null,
          lead.data.currentSystem || null,
          lead.data.stage || 'active',
          lead.lastMessageAt.toISOString(),
          lead.data.testSentAt || null,
          lead.data.email || null,
          lead.createdAt.toISOString(),
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  }

  // Processar mensagem do lead e gerar resposta com IA
  async processMessage(phone: string, message: string): Promise<string> {
    const lead = await this.getOrCreateLead(phone);

    // Adicionar mensagem ao histórico
    lead.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Manter apenas últimas 20 mensagens para não exceder limite de tokens
    if (lead.conversationHistory.length > 20) {
      lead.conversationHistory = lead.conversationHistory.slice(-20);
    }

    // Gerar resposta com IA
    const aiResponse = await this.generateAIResponse(lead, message);

    // Adicionar resposta ao histórico
    lead.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    // Extrair informações da conversa
    this.extractLeadData(lead, message);

    // Atualizar memória do chat
    await this.updateChatMemory(lead, message, aiResponse);

    // Salvar lead atualizado
    await this.saveLead(lead);

    // Salvar memória do chat
    await this.saveChatMemory(lead);

    return aiResponse;
  }

  // Gerar resposta usando OpenRouter AI
  private async generateAIResponse(lead: Lead, message: string): Promise<string> {
    try {
      console.log('🔑 OpenRouter Key:', OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 15)}...` : 'VAZIA!');
      // Construir contexto do lead
      const leadContext = Object.entries(lead.data)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      // Construir contexto de memória
      let memoryContext = '';
      if (lead.memory.conversationSummary) {
        memoryContext += `\n📝 RESUMO DE CONVERSAS ANTERIORES:\n${lead.memory.conversationSummary}\n`;
      }
      if (lead.memory.keyFacts.length > 0) {
        memoryContext += `\n💡 FATOS IMPORTANTES:\n${lead.memory.keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`;
      }
      if (lead.memory.lastTopics.length > 0) {
        memoryContext += `\n🗣️ ÚLTIMOS TÓPICOS:\n${lead.memory.lastTopics.join(', ')}\n`;
      }

      const systemPrompt = `${this.aiMemory}

INFORMAÇÕES DO CONTATO:
- Telefone: ${lead.phone}
- Nome: ${lead.name || 'Não informado ainda'}
${leadContext ? `\nDADOS COLETADOS:\n${leadContext}` : ''}
${memoryContext}

REGRAS IMPORTANTES:
- Responda SEMPRE em português do Brasil
- Mantenha respostas curtas (máximo 3-4 frases)
- Seja natural e conversacional
- Use a memória das conversas anteriores para ser mais contextual
- Se não souber algo, seja honesta
- Nunca mencione aspectos técnicos do sistema`;

      // Construir mensagens no formato OpenAI (compatível com OpenRouter)
      const messages = [
        { role: 'system', content: systemPrompt },
        ...lead.conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      // Chamar OpenRouter API
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: OPENROUTER_MODEL,
          messages: messages,
          temperature: 0.9,
          max_tokens: 250,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const aiResponse = response.data.choices?.[0]?.message?.content?.trim();

      if (aiResponse) {
        console.log('🤖 Resposta da IA gerada:', aiResponse.substring(0, 100) + '...');
        return aiResponse;
      } else {
        throw new Error('Resposta vazia da IA');
      }
    } catch (error: any) {
      console.error('❌ Erro ao chamar OpenRouter AI:', error.response?.data || error.message);
      return this.getFallbackResponse();
    }
  }

  // Resposta de fallback em caso de erro na IA
  private getFallbackResponse(): string {
    return 'Oi! 😊 Tive um probleminha aqui, mas já estou de volta!\nComo posso te ajudar?';
  }

  // Extrair informações úteis da mensagem
  private extractLeadData(lead: Lead, message: string) {
    const lowerMessage = message.toLowerCase();

    // Extrair nome (se não tiver)
    if (!lead.name) {
      const namePatterns = [
        /meu nome (?:é|e) ([a-záàâãéèêíïóôõöúçñ\s]+)/i,
        /(?:sou|me chamo) ([a-záàâãéèêíïóôõöúçñ\s]+)/i,
      ];

      for (const pattern of namePatterns) {
        const match = message.match(pattern);
        if (match) {
          lead.name = match[1].trim();
          break;
        }
      }
    }

    // Extrair email
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      lead.data.email = emailMatch[0];
    }

    // Detectar tipo de negócio
    if (lowerMessage.match(/loja|comércio|comercio|varejo/)) {
      lead.data.businessType = 'loja';
    } else if (lowerMessage.match(/mercado|supermercado|mercearia/)) {
      lead.data.businessType = 'mercado';
    } else if (lowerMessage.match(/posto|combustível|combustivel/)) {
      lead.data.businessType = 'posto';
    } else if (lowerMessage.match(/restaurante|bar|lanchonete/)) {
      lead.data.businessType = 'restaurante';
    }

    // Detectar sistema atual
    if (lowerMessage.match(/manual|caderno|papel|planilha/)) {
      lead.data.currentSystem = 'manual';
    } else if (lowerMessage.match(/sistema|software|programa/)) {
      lead.data.currentSystem = 'sistema';
    } else if (lowerMessage.match(/não|nao|nenhum/)) {
      lead.data.currentSystem = 'nenhum';
    }
  }

  // Atualizar memória do chat com base na conversa
  private async updateChatMemory(lead: Lead, userMessage: string, aiResponse: string) {
    try {
      // Adicionar último tópico (extrair palavras-chave)
      const keywords = this.extractKeywords(userMessage);
      if (keywords.length > 0) {
        lead.memory.lastTopics = [...new Set([...keywords, ...lead.memory.lastTopics])].slice(0, 5);
      }

      // Adicionar fatos importantes
      const facts = this.extractFacts(lead, userMessage);
      if (facts.length > 0) {
        lead.memory.keyFacts = [...new Set([...facts, ...lead.memory.keyFacts])].slice(0, 10);
      }

      // Atualizar resumo da conversa a cada 10 mensagens
      if (lead.conversationHistory.length % 10 === 0 && lead.conversationHistory.length > 0) {
        const recentConversation = lead.conversationHistory.slice(-10)
          .map(msg => `${msg.role === 'user' ? 'Cliente' : 'ISA'}: ${msg.content}`)
          .join('\n');

        lead.memory.conversationSummary = `Últimas ${lead.conversationHistory.length} mensagens. Tópicos: ${lead.memory.lastTopics.join(', ')}`;
      }
    } catch (error) {
      console.error('Erro ao atualizar memória do chat:', error);
    }
  }

  // Extrair palavras-chave da mensagem
  private extractKeywords(message: string): string[] {
    const keywords: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Palavras-chave de negócios
    const businessKeywords = ['pdv', 'sistema', 'estoque', 'vendas', 'preço', 'produto', 'mercado', 'loja', 'posto'];
    businessKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return keywords;
  }

  // Extrair fatos importantes
  private extractFacts(lead: Lead, message: string): string[] {
    const facts: string[] = [];

    // Nome
    if (lead.name && !lead.memory.keyFacts.includes(`Nome: ${lead.name}`)) {
      facts.push(`Nome: ${lead.name}`);
    }

    // Email
    if (lead.data.email && !lead.memory.keyFacts.includes(`Email: ${lead.data.email}`)) {
      facts.push(`Email: ${lead.data.email}`);
    }

    // Tipo de negócio
    if (lead.data.businessType && !lead.memory.keyFacts.includes(`Negócio: ${lead.data.businessType}`)) {
      facts.push(`Negócio: ${lead.data.businessType}`);
    }

    return facts;
  }

  // Recarregar memória da IA (chamar quando atualizar na interface)
  async reloadMemory() {
    // Limpar cache de memória antiga
    this.aiMemory = '';

    // Carregar nova memória
    await this.loadAIMemory();

    console.log('🔄 Memória da ISA recarregada e cache limpo');
    console.log('✅ Nova memória aplicada imediatamente');
  }

  // Limpar memória de um chat específico
  async clearChatMemory(phone: string) {
    try {
      const db = await getDatabase();
      await db.run('DELETE FROM chat_memory WHERE phone = ?', [phone]);

      if (this.leads.has(phone)) {
        const lead = this.leads.get(phone)!;
        lead.memory = {
          keyFacts: [],
          lastTopics: [],
          userPreferences: {},
        };
      }

      console.log(`🧹 Memória do chat ${phone} limpa`);
    } catch (error) {
      console.error('Erro ao limpar memória do chat:', error);
    }
  }
}

// Exportar instância singleton
export const salesBot = new SalesBotService();
