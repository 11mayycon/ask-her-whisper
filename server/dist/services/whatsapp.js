"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = exports.WhatsAppService = void 0;
const axios_1 = __importDefault(require("axios"));
const events_1 = require("events");
class WhatsAppService extends events_1.EventEmitter {
    constructor() {
        super();
        this.isReady = false;
        this.isAuthenticated = false;
        this.qrCode = '';
        this.statusCheckInterval = null;
        this.config = {
            baseUrl: process.env.EVOLUTION_API_URL || 'http://evolution_api:8080',
            apiKey: process.env.EVOLUTION_API_KEY || '',
            instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'isa-whatsapp'
        };
        this.api = axios_1.default.create({
            baseURL: this.config.baseUrl,
            headers: {
                'apikey': this.config.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }
    // Criar instância para usuário específico
    async createUserInstance(userEmail) {
        const instanceName = `isa_${userEmail.replace(/[@.]/g, '_')}`;
        try {
            console.log('📱 Verificando instância para:', userEmail);
            // Verificar se instância já existe
            try {
                const statusResponse = await this.api.get(`/instance/connectionState/${instanceName}`);
                console.log('✅ Instância já existe:', instanceName);
                // Se já existe, apenas busca o QR Code
                const connectResponse = await this.api.get(`/instance/connect/${instanceName}`);
                // Extrair QR Code da resposta
                const qrData = connectResponse.data.qrcode || connectResponse.data;
                const qrcode = qrData.base64 || qrData.code || null;
                return {
                    instanceName,
                    qrcode: qrcode,
                    status: statusResponse.data.state || 'disconnected'
                };
            }
            catch (checkError) {
                // Se não existe (404), criar nova instância
                if (checkError.response?.status === 404) {
                    console.log('📱 Criando nova instância para:', userEmail);
                    const response = await this.api.post('/instance/create', {
                        instanceName: instanceName,
                        qrcode: true,
                        integration: 'WHATSAPP-BAILEYS'
                    });
                    console.log('✅ Instância criada:', instanceName);
                    // Conectar para gerar QR Code
                    const connectResponse = await this.api.get(`/instance/connect/${instanceName}`);
                    // Extrair QR Code da resposta
                    const qrData = connectResponse.data.qrcode || connectResponse.data;
                    const qrcode = qrData.base64 || qrData.code || null;
                    return {
                        instanceName,
                        qrcode: qrcode,
                        status: 'disconnected'
                    };
                }
                throw checkError;
            }
        }
        catch (error) {
            console.error('❌ Erro ao criar instância:', error.response?.data || error.message);
            throw error;
        }
    }
    // Obter status de instância específica
    async getInstanceStatus(instanceName) {
        try {
            const response = await this.api.get(`/instance/connectionState/${instanceName}`);
            console.log('📊 Status retornado da Evolution API:', response.data);
            // Extrair state da estrutura correta
            const state = response.data.instance?.state || response.data.state || 'disconnected';
            return {
                instanceName,
                state: state,
                status: response.data
            };
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('❌ Instância não encontrada:', instanceName);
                return {
                    instanceName,
                    state: 'not_found',
                    status: null
                };
            }
            console.error('❌ Erro ao buscar status:', error.response?.data || error.message);
            throw error;
        }
    }
    // Obter QR Code de uma instância
    async getInstanceQRCode(instanceName) {
        try {
            // Primeiro verifica o status da instância
            const statusResponse = await this.api.get(`/instance/connectionState/${instanceName}`);
            const currentState = statusResponse.data.instance?.state || statusResponse.data.state || 'disconnected';
            // Se já está conectado, não há QR code
            if (currentState === 'open' || currentState === 'connected') {
                return {
                    qrcode: null,
                    status: currentState,
                    message: 'Instância já está conectada'
                };
            }
            const response = await this.api.get(`/instance/connect/${instanceName}`);
            // Extrair QR Code da resposta
            const qrData = response.data.qrcode || response.data;
            const qrcode = qrData.base64 || qrData.code || null;
            return {
                qrcode: qrcode,
                status: currentState
            };
        }
        catch (error) {
            console.error('❌ Erro ao buscar QR Code:', error.response?.data || error.message);
            throw error;
        }
    }
    // Desconectar instância
    async disconnectInstance(instanceName) {
        try {
            await this.api.delete(`/instance/logout/${instanceName}`);
            console.log('✅ Instância desconectada:', instanceName);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao desconectar:', error.response?.data || error.message);
            throw error;
        }
    }
    // Deletar instância
    async deleteUserInstance(instanceName) {
        try {
            await this.api.delete(`/instance/delete/${instanceName}`);
            console.log('✅ Instância deletada:', instanceName);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao deletar:', error.response?.data || error.message);
            throw error;
        }
    }
    async initialize() {
        console.log('🔄 Inicializando Evolution API...');
        try {
            // Verifica se a instância já existe
            const instanceExists = await this.checkInstance();
            if (!instanceExists) {
                // Cria a instância
                await this.createInstance();
            }
            // Verifica o status da conexão
            await this.checkConnectionStatus();
            // Inicia verificação periódica de status
            this.startStatusCheck();
        }
        catch (error) {
            console.error('❌ Erro ao inicializar Evolution API:', error);
            throw error;
        }
    }
    async checkInstance() {
        try {
            const response = await this.api.get(`/instance/connectionState/${this.config.instanceName}`);
            return response.status === 200;
        }
        catch (error) {
            if (error.response?.status === 404) {
                return false;
            }
            throw error;
        }
    }
    async createInstance() {
        console.log('📱 Criando instância Evolution...');
        try {
            const response = await this.api.post('/instance/create', {
                instanceName: this.config.instanceName,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            });
            console.log('✅ Instância criada com sucesso');
            return response.data;
        }
        catch (error) {
            console.error('❌ Erro ao criar instância:', error);
            throw error;
        }
    }
    async checkConnectionStatus() {
        try {
            const response = await this.api.get(`/instance/connectionState/${this.config.instanceName}`);
            const state = response.data.state;
            console.log('📊 Status da conexão:', state);
            if (state === 'open') {
                this.isReady = true;
                this.isAuthenticated = true;
                this.qrCode = '';
                this.emit('ready');
                console.log('✅ WhatsApp conectado e pronto!');
            }
            else if (state === 'close') {
                this.isReady = false;
                this.isAuthenticated = false;
                // Busca QR Code se disponível
                await this.fetchQRCode();
            }
            return state;
        }
        catch (error) {
            console.error('❌ Erro ao verificar status:', error);
            throw error;
        }
    }
    async fetchQRCode() {
        try {
            const response = await this.api.get(`/instance/connect/${this.config.instanceName}`);
            if (response.data.qrcode?.base64) {
                this.qrCode = response.data.qrcode.base64;
                console.log('📱 QR Code recebido');
                this.emit('qr', this.qrCode);
            }
        }
        catch (error) {
            console.error('❌ Erro ao buscar QR Code:', error);
        }
    }
    startStatusCheck() {
        // Verifica status a cada 5 segundos
        this.statusCheckInterval = setInterval(async () => {
            try {
                await this.checkConnectionStatus();
            }
            catch (error) {
                console.error('Erro na verificação de status:', error);
            }
        }, 5000);
    }
    async sendMessage(number, message) {
        if (!this.isReady) {
            throw new Error('WhatsApp não está pronto');
        }
        try {
            // Formata o número se necessário
            const formattedNumber = number.includes('@') ? number : `${number}@s.whatsapp.net`;
            const response = await this.api.post(`/message/sendText/${this.config.instanceName}`, {
                number: formattedNumber,
                text: message
            });
            return { success: true, data: response.data };
        }
        catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
        }
    }
    async sendMediaMessage(number, mediaUrl, caption) {
        if (!this.isReady) {
            throw new Error('WhatsApp não está pronto');
        }
        try {
            const formattedNumber = number.includes('@') ? number : `${number}@s.whatsapp.net`;
            const response = await this.api.post(`/message/sendMedia/${this.config.instanceName}`, {
                number: formattedNumber,
                mediaUrl: mediaUrl,
                caption: caption || ''
            });
            return { success: true, data: response.data };
        }
        catch (error) {
            console.error('❌ Erro ao enviar mídia:', error);
            throw error;
        }
    }
    // Buscar todos os chats/conversas (não precisa estar "ready")
    async getChats(instanceName) {
        const instance = instanceName || this.config.instanceName;
        try {
            console.log(`📱 Buscando chats da instância: ${instance}`);
            const response = await this.api.get(`/chat/findChats/${instance}`);
            console.log(`✅ ${response.data?.length || 0} chats encontrados`);
            return response.data || [];
        }
        catch (error) {
            console.error('❌ Erro ao buscar chats:', error.response?.data || error.message);
            throw error;
        }
    }
    // Buscar mensagens de um chat específico
    async getMessages(instanceName, remoteJid) {
        try {
            console.log(`📩 Buscando mensagens de ${remoteJid}`);
            const response = await this.api.post(`/chat/findMessages/${instanceName}`, {
                where: {
                    key: {
                        remoteJid: remoteJid
                    }
                }
            });
            console.log(`✅ ${response.data?.length || 0} mensagens encontradas`);
            return response.data || [];
        }
        catch (error) {
            console.error('❌ Erro ao buscar mensagens:', error.response?.data || error.message);
            throw error;
        }
    }
    async getContacts(instanceName) {
        const instance = instanceName || this.config.instanceName;
        try {
            const response = await this.api.get(`/chat/findContacts/${instance}`);
            return response.data || [];
        }
        catch (error) {
            console.error('❌ Erro ao buscar contatos:', error.response?.data || error.message);
            throw error;
        }
    }
    getQRCode() {
        return this.qrCode;
    }
    getStatus() {
        return {
            isReady: this.isReady,
            isAuthenticated: this.isAuthenticated,
            hasQRCode: !!this.qrCode
        };
    }
    async disconnect() {
        try {
            if (this.statusCheckInterval) {
                clearInterval(this.statusCheckInterval);
                this.statusCheckInterval = null;
            }
            await this.api.delete(`/instance/logout/${this.config.instanceName}`);
            this.isReady = false;
            this.isAuthenticated = false;
            this.qrCode = '';
            console.log('✅ Desconectado com sucesso');
        }
        catch (error) {
            console.error('❌ Erro ao desconectar:', error);
            throw error;
        }
    }
    async deleteInstance() {
        try {
            await this.api.delete(`/instance/delete/${this.config.instanceName}`);
            console.log('✅ Instância deletada com sucesso');
        }
        catch (error) {
            console.error('❌ Erro ao deletar instância:', error);
            throw error;
        }
    }
}
exports.WhatsAppService = WhatsAppService;
exports.whatsappService = new WhatsAppService();
