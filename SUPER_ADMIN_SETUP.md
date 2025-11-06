# Configuração do Super Admin

## Credenciais do Super Admin

O sistema cria automaticamente um super admin ao inicializar o banco de dados SQLite.

**Email:** `maiconsillva2025@gmail.com`  
**Senha:** `1285041`

## Como Fazer Login

1. Acesse a página de login admin: `/admin/login`
2. Digite o email: `maiconsillva2025@gmail.com`
3. Digite a senha: `1285041`
4. Clique em "ENTRAR COMO ADMINISTRADOR"

## Segurança

⚠️ **IMPORTANTE**: Após o primeiro login, recomendamos:
- Alterar a senha padrão
- Criar outros administradores se necessário
- Desativar ou remover este super admin padrão em produção

## Validação de Entrada

O formulário de login possui validação completa:
- ✅ Email deve ser válido e ter no máximo 255 caracteres
- ✅ Senha deve ter entre 6 e 100 caracteres
- ✅ Todos os campos são obrigatórios
- ✅ Mensagens de erro claras para o usuário

## Verificação do Super Admin

Para verificar se o super admin foi criado no banco SQLite:

```bash
sqlite3 server/data/isa.db "SELECT email, full_name FROM users WHERE email = 'maiconsillva2025@gmail.com';"
```

Para verificar as roles:

```bash
sqlite3 server/data/isa.db "SELECT u.email, ur.role FROM users u JOIN user_roles ur ON u.id = ur.user_id WHERE u.email = 'maiconsillva2025@gmail.com';"
```

## Estrutura do Banco

O super admin é criado automaticamente com:
- **Tabela `users`**: Registro do usuário com email e senha hasheada (bcrypt)
- **Tabela `user_roles`**: Role `super_admin` atribuída
- **Tabela `profiles`**: Perfil com nome "Super Admin"

## Reiniciar o Banco

Se precisar recriar o banco de dados:

```bash
# Deletar banco existente
rm server/data/isa.db

# Reiniciar servidor (irá recriar o banco e o super admin)
cd server
npm run dev
```
