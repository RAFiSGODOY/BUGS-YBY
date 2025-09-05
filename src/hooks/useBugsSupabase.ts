import { useState, useEffect, useCallback } from 'react';
import { Bug, BugCategory } from '../types/Bug';
import { supabaseService } from '../services/supabase';
import { useAuth } from './useAuth';
import { useAppVersion } from './useAppVersion';

export function useBugsSupabase() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [activeFilter, setActiveFilter] = useState<BugCategory | 'todos'>('todos');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastLocalUpdate, setLastLocalUpdate] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { currentVersion } = useAppVersion();

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar dados apenas do Supabase na inicialização
  useEffect(() => {
    if (isOnline) {
      console.log('🔄 Carregando dados iniciais do Supabase...');
      loadFromCloud();
    }
  }, [isOnline]);

  // Configurar Supabase Realtime
  useEffect(() => {
    if (!isOnline || !supabaseService.client) return;

    console.log('🔄 Configurando Supabase Realtime...');

    // Configurar canal de Realtime
    const channel = supabaseService.client
      .channel('bugs-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bugs' 
      }, (payload: any) => {
        console.log('🔔 Mudança recebida via Realtime:', payload);
        
        // Não recarregar se foi uma mudança local recente
        if (lastLocalUpdate && (Date.now() - lastLocalUpdate.getTime()) < 1000) {
          console.log('⏸️ Ignorando mudança - foi uma alteração local recente');
          return;
        }
        
        // Recarregar dados da nuvem
        loadFromCloud();
      })
      .subscribe();

    return () => {
      supabaseService.client.removeChannel(channel);
      console.log('⏹️ Supabase Realtime desativado');
    };
  }, [isOnline, lastLocalUpdate]);


  const loadFromCloud = useCallback(async () => {
    if (!isOnline) return;

    console.log('☁️ Carregando bugs do Supabase...');
    setIsSyncing(true);
    try {
      const response = await supabaseService.getBugs();
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const cloudBugs = dataArray.map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined,
        }));

        // Usar apenas os dados do Supabase (sem merge com dados locais)
        setBugs(cloudBugs);
        setLastSync(new Date());
        console.log('✅ Bugs carregados do Supabase:', cloudBugs.length);
      } else {
        console.error('❌ Falha ao carregar bugs do Supabase:', response.error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar do Supabase:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);




  const addBug = useCallback(async (bug: Omit<Bug, 'id' | 'createdAt' | 'version' | 'createdBy'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const newBug: Bug = {
      ...bug,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      version: currentVersion,
      createdBy: user.name || user.username,
    };

    console.log('➕ Criando novo bug:', newBug);

    // Sincronização DIRETA com a nuvem
    if (isOnline) {
      try {
        const response = await supabaseService.addBug(newBug);
        if (response.success) {
          setLastSync(new Date());
          setLastLocalUpdate(new Date());
          console.log('✅ Bug CRIADO e sincronizado! Recarregando dados...');
          // Recarregar dados do Supabase para garantir consistência
          await loadFromCloud();
        } else {
          console.error('❌ Erro ao sincronizar bug:', response.error);
          throw new Error(response.error || 'Erro ao criar bug');
        }
      } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        throw error;
      }
    } else {
      console.warn('⚠️ Offline - não é possível criar bug');
      throw new Error('Sem conexão com a internet');
    }
  }, [isOnline, loadFromCloud, user, currentVersion]);

  const updateBug = useCallback(async (id: string, updates: Partial<Bug>) => {
    console.log('🔄 Iniciando atualização do bug:', { id, updates });
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const currentBug = bugs.find(b => b.id === id);
    if (!currentBug) {
      console.error('❌ Bug não encontrado para atualização:', { id, availableBugs: bugs.map(b => b.id) });
      throw new Error('Bug não encontrado');
    }
    
    console.log('📋 Bug atual encontrado:', currentBug);
    
    // Preparar o bug atualizado
    let fixedAt = currentBug.fixedAt;
    if (updates.isFixed === true && !currentBug.isFixed) {
      fixedAt = new Date();
    } else if (updates.isFixed === false && currentBug.isFixed) {
      fixedAt = undefined;
    }
    
    const updatedBug: Bug = { 
      ...currentBug, 
      ...updates,
      fixedAt,
      lastModifiedBy: user.name || user.username,
      lastModifiedAt: new Date()
    };

    // Sincronização DIRETA com a nuvem (sem atualização local primeiro)
    if (isOnline) {
      console.log('☁️ Sincronizando diretamente com Supabase...');
      try {
        const response = await supabaseService.updateBug(updatedBug);
        if (response.success) {
          setLastSync(new Date());
          setLastLocalUpdate(new Date());
          console.log(`✅ Bug sincronizado com Supabase! Recarregando dados...`);
          // Recarregar dados do Supabase para garantir consistência
          await loadFromCloud();
        } else {
          console.error('❌ Erro ao sincronizar com Supabase:', response.error);
          throw new Error(response.error || 'Erro ao sincronizar');
        }
      } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        throw error;
      }
    } else {
      console.warn('⚠️ Offline - não é possível sincronizar');
      throw new Error('Sem conexão com a internet');
    }
  }, [isOnline, bugs, loadFromCloud, user]);

  const deleteBug = useCallback(async (id: string) => {
    const bugToDelete = bugs.find(b => b.id === id);
    if (!bugToDelete) {
      console.error('❌ Bug não encontrado para exclusão:', { id });
      throw new Error('Bug não encontrado');
    }
    
    console.log('🗑️ Excluindo bug:', bugToDelete);

    // Sincronização DIRETA com a nuvem
    if (isOnline) {
      try {
        const response = await supabaseService.deleteBug(id);
        if (response.success) {
          setLastSync(new Date());
          setLastLocalUpdate(new Date());
          console.log('✅ Bug EXCLUÍDO e sincronizado! Recarregando dados...');
          // Recarregar dados do Supabase para garantir consistência
          await loadFromCloud();
        } else {
          console.error('❌ Erro ao remover bug da nuvem:', response.error);
          throw new Error(response.error || 'Erro ao excluir bug');
        }
      } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        throw error;
      }
    } else {
      console.warn('⚠️ Offline - não é possível excluir bug');
      throw new Error('Sem conexão com a internet');
    }
  }, [isOnline, bugs, loadFromCloud, user]);

  const filteredBugs = bugs.filter(bug => 
    activeFilter === 'todos' || bug.category === activeFilter
  );

  return {
    bugs: filteredBugs,
    activeFilter,
    setActiveFilter,
    addBug,
    updateBug,
    deleteBug,
    isOnline,
    lastSync,
    isSyncing,
  };
}