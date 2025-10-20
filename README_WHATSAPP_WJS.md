# ISA 2.5 - WhatsApp Web JS Integration

## 🚀 Sobre a Migração

O projeto ISA 2.5 foi migrado para usar **WhatsApp Web JS** (wwebjs.dev) como integração de WhatsApp, substituindo completamente a Evolution API.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- VPS ou servidor com acesso root
- Pelo menos 2GB RAM disponível
- Google Chrome ou Chromium instalado no servidor

## 🔧 Instalação no Servidor

### 1. Instalar Dependências do Sistema

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget chromium-browser
```

### 2. Clonar e Configurar o Projeto

```bash
# Clonar repositório
git clone <seu-repositorio>
cd isa-2.5

# Copiar arquivo de configuração
cp .env.example .env

# Editar variáveis de ambiente
nano .env
```

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:

```env
VITE_BACKEND_URL=http://seu-ip-ou-dominio:3001
DATABASE_URL=sua_connection_string_postgresql
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key
GROQ_API_KEY=sua_groq_api_key
```

### 4. Instalar Dependências Node.js

```bash
# Instalar dependências do servidor
cd server
npm install
npm run build

# Instalar dependências do frontend
cd ..
npm install
npm run build
```

### 5. Iniciar Servidor Backend

```bash
# Modo desenvolvimento
cd server
npm run dev

# Modo produção (recomendado)
npm start
```

### 6. Configurar PM2 para Produção (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar servidor com PM2
cd server
pm2 start dist/index.js --name "isa-backend"

# Salvar configuração PM2
pm2 save

# Configurar inicialização automática
pm2 startup
```

## 🔐 Autenticação WhatsApp

### Como Conectar

1. Acesse o painel admin em: `http://seu-servidor/admin`
2. Navegue para **Conexão WhatsApp**
3. Aguarde o QR Code ser gerado automaticamente
4. Abra WhatsApp no celular
5. Vá em: **Mais opções → Dispositivos conectados → Conectar dispositivo**
6. Escaneie o QR Code

### Persistência da Sessão

A sessão do WhatsApp é salva automaticamente na pasta `.wwebjs_auth/`. 

**IMPORTANTE:** Faça backup regular dessa pasta para não perder a autenticação!

```bash
# Fazer backup da sessão
tar -czf wwebjs-backup-$(date +%Y%m%d).tar.gz .wwebjs_auth/
```

## 🌐 Configurar Nginx (Opcional)

Para usar domínio e SSL:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting

### Erro: "Puppeteer não consegue iniciar Chrome"

```bash
# Instalar dependências faltantes
sudo apt install -y chromium-browser

# Verificar se Chrome está acessível
chromium-browser --version
```

### Erro: "WhatsApp não conecta"

1. Verifique logs: `pm2 logs isa-backend`
2. Limpe sessão antiga: `rm -rf .wwebjs_auth/`
3. Reinicie servidor: `pm2 restart isa-backend`
4. Gere novo QR Code

### Erro: "Memória insuficiente"

```bash
# Aumentar swap (Ubuntu)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📊 Monitoramento

```bash
# Ver logs em tempo real
pm2 logs isa-backend

# Status do servidor
pm2 status

# Monitorar recursos
pm2 monit
```

## 🔄 Atualizações

```bash
# Pull última versão
git pull origin main

# Reinstalar dependências
cd server && npm install && npm run build
cd .. && npm install && npm run build

# Reiniciar servidor
pm2 restart isa-backend
```

## 📁 Estrutura do Projeto

```
isa-2.5/
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   └── whatsapp.ts          # Serviço WhatsApp Web JS
│   │   ├── routes/
│   │   │   └── whatsapp-wjs.ts      # Rotas WhatsApp
│   │   └── index.ts                  # Servidor principal
│   └── package.json
├── src/
│   ├── lib/
│   │   └── whatsapp-wjs-client.ts   # Cliente WhatsApp frontend
│   └── pages/
│       └── admin/
│           └── WhatsAppConnection.tsx
└── .wwebjs_auth/                     # Sessão WhatsApp (NÃO commitar!)
```

## ⚠️ Segurança

- **NUNCA** commite a pasta `.wwebjs_auth/`
- Adicione ao `.gitignore`:
  ```
  .wwebjs_auth/
  .env
  ```
- Use firewall para proteger porta 3001
- Configure SSL/TLS com Let's Encrypt

## 📞 Suporte

Para problemas, abra uma issue no repositório ou contate: [email]

---

**Desenvolvido por:** InovaPro Technology  
**Versão:** 2.5  
**Licença:** MIT
