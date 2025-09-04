import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState, LoginCredentials, AuthContextType } from '../types/Auth';

// Configuração de usuários (em produção, isso viria de um servidor)
const USERS_CONFIG = {
  admin: {
    username: 'admin',
    password: 'admin123', // Em produção, use hash + salt
    role: 'admin' as const
  },
  users: {
    username: 'usuarios',
    password: 'user123', // Em produção, use hash + salt
    role: 'user' as const
  }
};

const AUTH_STORAGE_KEY = 'yby-auth';

// Context para compartilhar estado de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Carrega usuário logado do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        setAuthState({
          user: {
            ...userData,
            createdAt: new Date(userData.createdAt)
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Simula delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verifica credenciais
      const userConfig = Object.values(USERS_CONFIG).find(
        config => config.username === credentials.username && 
                  config.password === credentials.password
      );

      if (userConfig) {
        const user: User = {
          id: userConfig.username,
          username: userConfig.username,
          role: userConfig.role,
          createdAt: new Date()
        };

        // Salva no localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
