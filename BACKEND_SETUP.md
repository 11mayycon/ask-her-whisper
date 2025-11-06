# Configuração do Backend SQLite

## ⚠️ IMPORTANTE: Backend Precisa Estar Rodando

O frontend foi configurado para usar um **backend Node.js + SQLite** que está na pasta `server/`.

**O backend PRECISA estar rodando** para que o login funcione!

## Como Iniciar o Backend Localmente

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente

Certifique-se que o arquivo `server/.env` existe com:

```env
SQLITE_DB_PATH=/app/data/isa.db
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
PORT=3001
NODE_ENV=development
```

### 3. Iniciar o Servidor

```bash
cd server
npm run dev
```

O backend iniciará em `http://localhost:3001`

## Verificar Se o Backend Está Funcionando

Abra o navegador em: `http://localhost:3001/api/admin/stats`

Deve retornar algo como:
```json
{
  "iaAtendendo": 0,
  "finalizados": 0,
  "ultimos15Dias": 0,
  "agentesOnline": 0
}
```

## Proxy Configurado

O Vite está configurado com proxy para redirecionar:
- Frontend: `http://localhost:8080`
- Requisições `/api/*` → Backend: `http://localhost:3001/*`

## Troubleshooting

### Erro "Failed to fetch"

**Causa:** Backend não está rodando

**Solução:**
1. Abra um terminal na pasta `server/`
2. Execute `npm run dev`
3. Aguarde a mensagem "✅ Servidor rodando na porta 3001"
4. Recarregue a página de login

### Erro "Cannot find module"

**Causa:** Dependências não instaladas

**Solução:**
```bash
cd server
npm install
npm run dev
```

### Banco de Dados Não Existe

**Causa:** Banco SQLite ainda não foi criado

**Solução:** O banco será criado automaticamente na primeira execução em `server/data/isa.db`

## Super Admin Automático

O backend cria automaticamente um super admin:
- **Email:** `maiconsillva2025@gmail.com`
- **Senha:** `1285041`

## Estrutura do Projeto

```
├── server/               # Backend Node.js
│   ├── src/             # Código TypeScript
│   │   ├── config/      # Configuração SQLite
│   │   ├── routes/      # Rotas da API
│   │   └── index.ts     # Servidor Express
│   ├── data/            # Banco SQLite (criado automaticamente)
│   └── package.json     # Dependências backend
│
└── src/                 # Frontend React
    ├── lib/
    │   └── api.ts       # Client API
    └── pages/
        └── AdminLogin.tsx
```

## URLs da API

Todas as rotas do backend:

- `POST /auth/login` - Login
- `POST /auth/signup` - Cadastro
- `GET /auth/me` - Dados do usuário atual
- `GET /admin/stats` - Estatísticas do dashboard
- `GET /admin/admins` - Listar administradores
- `POST /admin/admins` - Criar administrador
- `DELETE /admin/admins/:id` - Deletar administrador

## Deploy em Produção

Para produção, você precisará:

1. Deploy do backend em um servidor com Node.js
2. Atualizar `.env` com a URL do backend em produção:
   ```env
   VITE_API_URL=https://seu-backend.com
   ```
3. Deploy do frontend no Lovable ou outro serviço

## Alternativas

Se não quiser rodar backend local:

1. **Docker Compose** (já configurado):
   ```bash
   docker-compose up -d
   ```

2. **Deploy backend em:**
   - Railway.app
   - Render.com
   - Fly.io
   - DigitalOcean
