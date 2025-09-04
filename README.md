# 🐛 YBY Bugs - Sistema de Gerenciamento de Bugs

Sistema completo de gerenciamento de bugs com autenticação e sincronização online.

## ✨ Funcionalidades

- 🔐 **Sistema de Login** com dois tipos de usuários
- 👑 **Admin**: Pode marcar bugs como corrigidos
- 👥 **Usuários**: Podem criar, editar e excluir bugs
- ☁️ **Sincronização Online**: Dados sincronizados entre dispositivos
- 📱 **Interface Responsiva**: Design moderno com Tailwind CSS
- 💾 **Armazenamento Local**: Funciona offline
- 🔄 **Sincronização Automática**: A cada 30 segundos quando online

## 🚀 Como Usar

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/RAFiSGODOY/BUGS-YBY.git

# Entre na pasta
cd BUGS-YBY

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### 2. Configuração da Sincronização Online

Para que os dados sejam sincronizados entre dispositivos:

1. **Crie uma conta gratuita** em [JSONBin.io](https://jsonbin.io/)
2. **Gere uma API Key** na seção "API Keys"
3. **Abra o arquivo** `src/config/api.ts`
4. **Substitua** `YOUR_API_KEY_HERE` pela sua chave real
5. **Salve o arquivo** e recarregue a aplicação

```typescript
// src/config/api.ts
export const API_CONFIG = {
  API_KEY: 'sua-chave-aqui', // ← Substitua aqui
  // ... resto da configuração
};
```

### 3. Credenciais de Acesso

**Admin (Você):**
- Usuário: `admin`
- Senha: `admin123`
- Permissões: Pode marcar bugs como corrigidos

**Usuários (Seus amigos):**
- Usuário: `usuarios`
- Senha: `user123`
- Permissões: Podem criar bugs

## 🏗️ Tecnologias

- **React 18** + **TypeScript**
- **Tailwind CSS** para estilização
- **Vite** para build
- **JSONBin.io** para sincronização online
- **localStorage** para armazenamento local

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── BugCard.tsx     # Card individual do bug
│   ├── BugForm.tsx     # Formulário de criação
│   ├── BugList.tsx     # Lista de bugs
│   ├── Header.tsx      # Cabeçalho com stats
│   ├── LoginForm.tsx   # Formulário de login
│   └── SyncStatus.tsx  # Status de sincronização
├── hooks/              # Hooks personalizados
│   ├── useAuth.tsx     # Gerenciamento de autenticação
│   └── useBugsSync.ts  # Gerenciamento de bugs com sync
├── services/           # Serviços
│   └── api.ts          # API para JSONBin.io
├── types/              # Tipos TypeScript
│   ├── Auth.ts         # Tipos de autenticação
│   └── Bug.ts          # Tipos de bugs
└── config/             # Configurações
    └── api.ts          # Configuração da API
```

## 🔧 Configuração Avançada

### Personalizar Credenciais

Para alterar as credenciais de login, edite o arquivo `src/hooks/useAuth.tsx`:

```typescript
const USERS_CONFIG = {
  admin: {
    username: 'seu-usuario',
    password: 'sua-senha',
    role: 'admin' as const
  },
  // ...
};
```

### Personalizar Intervalo de Sincronização

No arquivo `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  SYNC_INTERVAL: 60000, // 60 segundos
  // ...
};
```

## 🌐 Deploy

### GitHub Pages

1. **Build do projeto:**
```bash
npm run build
```

2. **Configure GitHub Pages** para servir a pasta `dist/`

3. **Acesse** `https://seu-usuario.github.io/BUGS-YBY`

### Netlify/Vercel

1. **Conecte seu repositório** GitHub
2. **Configure** o build command: `npm run build`
3. **Configure** o publish directory: `dist`

## 🔒 Segurança

- Senhas são armazenadas em texto simples (adequado para uso local)
- Dados são sincronizados via HTTPS
- Controle de acesso baseado em roles
- Validação de dados no frontend

## 📝 Licença

Este projeto é de uso livre para fins educacionais e pessoais.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique se a API Key está configurada corretamente
2. Confirme se está online para sincronização
3. Verifique o console do navegador para erros
4. Abra uma issue no GitHub

---

**Desenvolvido com ❤️ para gerenciar bugs de forma eficiente!**
