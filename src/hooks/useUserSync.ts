import { useEffect } from 'react';
import { userService } from '../services/userService';
import { PREDEFINED_USERS } from '../types/User';
import { useAuth } from './useAuth';

export function useUserSync() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const syncUsers = async () => {
      try {
        console.log('🔄 Sincronizando usuários pré-definidos...');
        
        // Sincronizar usuários pré-definidos
        const response = await userService.syncPredefinedUsers(PREDEFINED_USERS);
        
        if (response.success) {
          console.log('✅ Usuários sincronizados com sucesso');
        } else {
          console.warn('⚠️ Falha na sincronização de usuários:', response.error);
        }

        // Atualizar último login do usuário atual
        if (user.id) {
          await userService.updateLastLogin(user.id);
        }
      } catch (error) {
        console.error('❌ Erro na sincronização de usuários:', error);
      }
    };

    // Executar sincronização apenas uma vez por sessão
    const hasSync = sessionStorage.getItem('user-sync-done');
    if (!hasSync) {
      syncUsers();
      sessionStorage.setItem('user-sync-done', 'true');
    } else {
      // Apenas atualizar último login
      if (user.id) {
        userService.updateLastLogin(user.id);
      }
    }
  }, [isAuthenticated, user]);
}