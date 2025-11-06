# Configuração do Banco de Dados LocalStorage

## ✅ Sem Backend Necessário!

A aplicação agora usa **localStorage** ao invés de backend SQLite/Node.js.

Isso significa que:
- ✅ Não precisa rodar servidor backend
- ✅ Funciona direto no navegador
- ✅ Sem necessidade de configuração
- ✅ Super Admin criado automaticamente

## Super Admin Padrão

**Email:** `maiconsillva2025@gmail.com`  
**Senha:** `1285041`

O super admin é criado automaticamente na primeira vez que você acessa a aplicação.

## Como Funciona

### Armazenamento
Todos os dados são salvos no `localStorage` do navegador:
- `admins` - Lista de administradores
- `stats` - Estatísticas do dashboard

### Primeiro Acesso
Na primeira vez que a aplicação carrega, o sistema automaticamente:
1. Cria o super admin com as credenciais acima
2. Inicializa as estatísticas zeradas
3. Salva tudo no localStorage

### Login
1. Acesse `/admin/login`
2. Digite o email e senha do super admin
3. Você será redirecionado para `/admin/dashboard`

## Funcionalidades Disponíveis

### ✅ Autenticação
- Login com email e senha
- Validação com Zod
- Token JWT simulado (base64)
- Logout

### ✅ Gerenciamento de Admins
- Listar todos os administradores
- Criar novos administradores
- Deletar administradores (exceto super admin)
- Roles: `super_admin` e `admin`

### ✅ Dashboard
- Estatísticas em tempo real
- Atendimentos ativos
- Métricas dos últimos 15 dias

## Resetar o Banco de Dados

Se precisar resetar tudo, abra o console do navegador e execute:

```javascript
localStorage.clear();
location.reload();
```

Ou use a função helper:

```javascript
import { localDB } from './src/lib/local-storage-db';
localDB.resetDatabase();
```

## Estrutura de Dados

### Admin
```typescript
{
  id: string;              // UUID
  email: string;           // Email único
  password: string;        // Senha (plain text - use hash em produção!)
  name: string;            // Nome completo
  role: 'super_admin' | 'admin';
  cpf?: string;           // CPF opcional
  created_at: string;     // ISO timestamp
}
```

### Stats
```typescript
{
  iaAtendendo: number;      // Atendimentos ativos da IA
  finalizados: number;      // Total de atendimentos finalizados
  ultimos15Dias: number;    // Atendimentos dos últimos 15 dias
  agentesOnline: number;    // Agentes online agora
}
```

## Limitações

⚠️ **Dados no Navegador**: Todos os dados ficam no navegador. Se limpar o cache/localStorage, perde tudo.

⚠️ **Senha em Texto Plano**: Por simplicidade, as senhas não estão com hash. Em produção, use bcrypt!

⚠️ **Sem Sincronização**: Cada navegador tem seus próprios dados. Não há sincronização entre dispositivos.

⚠️ **Limite de Armazenamento**: localStorage tem limite de ~5-10MB dependendo do navegador.

## Migração para Backend Real

Quando quiser migrar para um backend real:

1. Mantenha a interface do `api.ts`
2. Substitua as chamadas do `localDB` por `fetch()` 
3. Implemente o backend (Node.js, Django, etc.)
4. Atualize as URLs no `.env`

A vantagem é que a interface da API permanece a mesma, facilitando a migração!

## Segurança

### ⚠️ NÃO USE EM PRODUÇÃO SEM MELHORIAS

Para produção, você DEVE:
- [ ] Usar backend real com banco de dados
- [ ] Hash de senhas (bcrypt, argon2)
- [ ] Tokens JWT reais com chave secreta
- [ ] HTTPS obrigatório
- [ ] Rate limiting
- [ ] Validação server-side
- [ ] Auditoria de logs

## Desenvolvimento vs Produção

### Desenvolvimento (Atual)
✅ Rápido para testar  
✅ Sem configuração  
✅ Funciona offline  
❌ Dados não persistem entre navegadores  
❌ Inseguro para produção  

### Produção (Recomendado)
✅ Dados persistentes  
✅ Sincronização entre dispositivos  
✅ Segurança robusta  
✅ Backup automático  
❌ Requer infraestrutura  
❌ Mais complexo  

## Próximos Passos

1. **Teste o Login**: Use as credenciais do super admin
2. **Explore o Dashboard**: Veja as estatísticas
3. **Crie Novos Admins**: Teste o CRUD de administradores
4. **Migre para Backend**: Quando estiver pronto para produção
