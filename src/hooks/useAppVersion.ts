import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_VERSION } from '../types/User';
import { useAuth } from './useAuth';
import { versionService } from '../services/versionService';

export function useAppVersion() {
  const [currentVersion, setCurrentVersion] = useState<string>(DEFAULT_VERSION);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Carrega versão atual do banco de dados
  const loadCurrentVersion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await versionService.getCurrentVersion();
      if (response.success && response.data) {
        setCurrentVersion(response.data.version);
      } else {
        console.warn('⚠️ Usando versão padrão:', DEFAULT_VERSION);
        setCurrentVersion(DEFAULT_VERSION);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar versão:', error);
      setCurrentVersion(DEFAULT_VERSION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentVersion();
  }, [loadCurrentVersion]);

  // Atualiza versão (apenas admin)
  const updateVersion = useCallback(async (newVersion: string) => {
    if (!isAdmin) {
      console.warn('⚠️ Apenas administradores podem alterar a versão');
      return false;
    }

    if (!newVersion.trim()) {
      console.warn('⚠️ Versão não pode estar vazia');
      return false;
    }

    if (!user) {
      console.warn('⚠️ Usuário não autenticado');
      return false;
    }

    try {
      const response = await versionService.setCurrentVersion(
        newVersion.trim(), 
        user.name || user.username
      );
      
      if (response.success) {
        setCurrentVersion(newVersion.trim());
        console.log('✅ Versão atualizada para:', newVersion.trim());
        return true;
      } else {
        console.error('❌ Erro ao atualizar versão:', response.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar versão:', error);
      return false;
    }
  }, [isAdmin, user]);

  return {
    currentVersion,
    updateVersion,
    canUpdateVersion: isAdmin,
    isLoading,
    refreshVersion: loadCurrentVersion
  };
}