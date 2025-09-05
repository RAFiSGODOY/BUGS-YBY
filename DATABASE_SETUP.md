# 🗄️ Configuração do Banco de Dados

## 📋 Instruções para Configurar o Supabase

### 1. **Criar Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha um nome (ex: "bugs-yby")
4. Defina uma senha para o banco
5. Aguarde a criação (2-3 minutos)

### 2. **Executar Script SQL**
1. Vá em **SQL Editor** no painel do Supabase
2. Copie todo o conteúdo do arquivo `database/setup.sql`
3. Cole no editor e clique em **Run**
4. Verifique se todas as tabelas foram criadas

### 3. **Configurar Chaves da API**
1. Vá em **Settings > API**
2. Copie a **Project URL** e **anon public key**
3. Substitua em `src/config/supabase.ts`:
   ```typescript
   export const SUPABASE_CONFIG = {
     URL: 'SUA_PROJECT_URL_AQUI',
     ANON_KEY: 'SUA_ANON_KEY_AQUI',
     // ...
   };
   ```

## 🏗️ Estrutura das Tabelas

### **Tabela: `bugs`**
```sql
- id (bigint, PK, auto-increment)
- original_id (text, unique) - UUID original
- title (text, not null)
- description (text)
- category (text, not null)
- priority (text, not null)
- is_fixed (boolean, default false)
- created_at (timestamp, default now())
- fixed_at (timestamp, nullable)
- screenshot (text, nullable)
- platform (text, nullable)
- device_info (text, nullable)
- user_id (text, default 'shared')
- version (text, not null, default '1.0.0') ✨ NOVO
- created_by (text, not null) ✨ NOVO
- last_modified_by (text, nullable) ✨ NOVO
- last_modified_at (timestamp, nullable) ✨ NOVO
```

### **Tabela: `users`** ✨ NOVA
```sql
- id (text, PK) - ID único do usuário
- name (text, not null) - Nome completo
- email (text, unique, nullable)
- role (text, not null, default 'user') - 'admin' ou 'user'
- is_active (boolean, default true)
- created_at (timestamp, default now())
- last_login (timestamp, nullable)
```

### **Tabela: `app_versions`** ✨ NOVA
```sql
- id (bigint, PK, auto-increment)
- version (text, not null, unique)
- is_current (boolean, default false)
- created_by (text, not null)
- created_at (timestamp, default now())
- description (text, nullable)
```

## 👥 Usuários Pré-definidos

O sistema vem com **11 usuários** já configurados:

| ID | Nome | Email | Role | Senha |
|---|---|---|---|---|
| `admin` | Administrador | admin@yby.com | admin | `admin123` |
| `rafael` | Rafael | rafael@yby.com | user | `rafael123` |
| `maria` | Maria Silva | maria@yby.com | user | `maria123` |
| `joao` | João Santos | joao@yby.com | user | `joao123` |
| `ana` | Ana Costa | ana@yby.com | user | `ana123` |
| `pedro` | Pedro Oliveira | pedro@yby.com | user | `pedro123` |
| `carla` | Carla Ferreira | carla@yby.com | user | `carla123` |
| `lucas` | Lucas Almeida | lucas@yby.com | user | `lucas123` |
| `julia` | Julia Rodrigues | julia@yby.com | user | `julia123` |
| `bruno` | Bruno Lima | bruno@yby.com | user | `bruno123` |
| `fernanda` | Fernanda Souza | fernanda@yby.com | user | `fernanda123` |

## 🔧 Funcionalidades Implementadas

### **Sistema de Versões**
- ✅ Versão padrão: `1.0.0`
- ✅ Apenas **admin** pode alterar versões
- ✅ Todos os bugs são criados com a versão atual
- ✅ Histórico de versões no banco

### **Sistema de Usuários**
- ✅ **11 usuários** pré-definidos
- ✅ Roles: `admin` e `user`
- ✅ Gerenciamento completo (CRUD)
- ✅ Ativar/Desativar usuários
- ✅ Rastreamento de último login

### **Rastreamento de Alterações**
- ✅ **Criação:** Usuário + versão + timestamp
- ✅ **Modificação:** Usuário + timestamp da última alteração
- ✅ **Histórico:** Completo de quem fez o quê e quando

### **Permissões**
- ✅ **Admin:** Pode tudo (gerenciar usuários, versões, bugs)
- ✅ **User:** Pode criar/editar bugs, mas não gerenciar sistema
- ✅ **Segurança:** Validação de roles em todas as operações

## 🚀 Como Usar

1. **Configure o Supabase** seguindo os passos acima
2. **Execute o script SQL** para criar as tabelas
3. **Atualize as configurações** em `src/config/supabase.ts`
4. **Faça login** com qualquer usuário da tabela acima
5. **Admin:** Pode gerenciar usuários e versões
6. **Usuários:** Podem criar e gerenciar bugs

## 🔍 Verificação

Para verificar se tudo está funcionando:

1. **Tabelas criadas:** Vá em "Table Editor" e veja se as 3 tabelas existem
2. **Dados inseridos:** Verifique se há 11 usuários e 1 versão
3. **Login:** Teste fazer login com `admin` / `admin123`
4. **Funcionalidades:** Teste criar bugs, alterar versões, gerenciar usuários

## ⚠️ Importante

- **Backup:** Sempre faça backup antes de executar scripts SQL
- **Ambiente:** Teste primeiro em ambiente de desenvolvimento
- **Segurança:** Em produção, use senhas mais seguras
- **RLS:** Considere habilitar Row Level Security para maior segurança

## 🆘 Problemas Comuns

### **Erro: "relation does not exist"**
- Execute o script SQL completo no SQL Editor

### **Erro: "column does not exist"**
- Verifique se todas as colunas foram adicionadas corretamente

### **Login não funciona**
- Verifique se os usuários foram inseridos na tabela `users`

### **Versão não carrega**
- Verifique se há uma versão marcada como `is_current = true`