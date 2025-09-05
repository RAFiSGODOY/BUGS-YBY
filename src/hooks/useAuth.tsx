import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState, LoginCredentials, AuthContextType } from '../types/Auth';
import { PREDEFINED_USERS } from '../types/User';

// Configuração de senhas (em produção, isso viria de um servidor com hash)
const USER_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  rafael: 'rafael123',
  maria: 'maria123',
  joao: 'joao123',
  ana: 'ana123',
  pedro: 'pedro123',
  carla: 'carla123',
  lucas: 'lucas123',
  julia: 'julia123',
  bruno: 'bruno123',
  fernanda: 'fernanda123'
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

      // Busca usuário pelo username
      const userProfile = PREDEFINED_USERS.find(u => u.id === credentials.username);
      const password = USER_PASSWORDS[credentials.username];

      if (userProfile && password === credentials.password) {
        const user: User = {
          id: userProfile.id,
          username: userProfile.id,
          role: userProfile.role,
          createdAt: new Date(),
          name: userProfile.name,
          email: userProfile.email
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
