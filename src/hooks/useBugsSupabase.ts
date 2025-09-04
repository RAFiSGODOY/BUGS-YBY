import { useState, useEffect, useCallback } from 'react';
import { Bug, BugCategory } from '../types/Bug';
import { supabaseService } from '../services/supabase';
import { SUPABASE_CONFIG } from '../config/supabase';

export function useBugsSupabase() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [activeFilter, setActiveFilter] = useState<BugCategory | 'todos'>('todos');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Carregar bugs do localStorage na inicialização
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Sincronizar automaticamente quando online
  useEffect(() => {
    if (isOnline && bugs.length > 0) {
      syncToCloud();
    }
  }, [isOnline]);

  // Sincronização automática periódica
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      syncFromCloud();
    }, SUPABASE_CONFIG.SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('yby-bugs');
      if (stored) {
        const parsedBugs = JSON.parse(stored).map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined,
        }));
        setBugs(parsedBugs);
        console.log('📱 Bugs carregados do localStorage:', parsedBugs.length);
      }
    } catch (error) {
      console.error('Erro ao carregar bugs do localStorage:', error);
    }
  };

  const saveToLocalStorage = (bugsToSave: Bug[]) => {
    try {
      localStorage.setItem('yby-bugs', JSON.stringify(bugsToSave));
      console.log('💾 Bugs salvos no localStorage:', bugsToSave.length);
    } catch (error) {
      console.error('Erro ao salvar bugs no localStorage:', error);
    }
  };

  const syncToCloud = async () => {
    if (!isOnline || isSyncing) {
      console.log('⏸️ Sincronização pausada:', { isOnline, isSyncing });
      return;
    }

    // Garantir que temos dados válidos para enviar
    const bugsToSync = Array.isArray(bugs) ? bugs : [];
    
    console.log('🔄 Iniciando sincronização para Supabase...', { bugsCount: bugsToSync.length });
    setIsSyncing(true);
    try {
      const response = await supabaseService.syncBugs(bugsToSync);
      if (response.success) {
        setLastSync(new Date());
        console.log('✅ Bugs sincronizados para Supabase:', response.data);
      } else {
        console.error('❌ Erro ao sincronizar para Supabase:', response.error);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromCloud = async () => {
    if (!isOnline || isSyncing) {
      console.log('⏸️ Sincronização da nuvem pausada:', { isOnline, isSyncing });
      return;
    }

    console.log('🔄 Iniciando sincronização do Supabase...');
    setIsSyncing(true);
    try {
      const response = await supabaseService.getBugs();
      if (response.success && response.data) {
        // Verificar se response.data é um array
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const cloudBugs = dataArray.map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined,
        }));

        // Mesclar bugs locais com os da nuvem
        const mergedBugs = mergeBugs(bugs, cloudBugs);
        setBugs(mergedBugs);
        saveToLocalStorage(mergedBugs);
        setLastSync(new Date());
        console.log('✅ Bugs sincronizados do Supabase:', { 
          localBugs: bugs.length, 
          cloudBugs: cloudBugs.length, 
          mergedBugs: mergedBugs.length 
        });
      } else {
        console.log('ℹ️ Nenhum dado no Supabase ou erro:', response.error);
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar do Supabase:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const mergeBugs = (localBugs: Bug[], cloudBugs: Bug[]): Bug[] => {
    const merged = new Map<string, Bug>();

    // Adicionar bugs locais
    localBugs.forEach(bug => {
      merged.set(bug.id, bug);
    });

    // Adicionar/atualizar com bugs da nuvem
    cloudBugs.forEach(cloudBug => {
      const localBug = merged.get(cloudBug.id);
      if (!localBug || cloudBug.createdAt > localBug.createdAt) {
        merged.set(cloudBug.id, cloudBug);
      }
    });

    return Array.from(merged.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  };

  const addBug = useCallback((bug: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bug,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    setBugs(prev => {
      const updated = [newBug, ...prev];
      saveToLocalStorage(updated);
      return updated;
    });

    // Sincronizar com a nuvem se online
    if (isOnline) {
      setTimeout(() => syncToCloud(), 1000);
    }
  }, [isOnline]);

  const updateBug = useCallback((id: string, updates: Partial<Bug>) => {
    setBugs(prev => {
      const updated = prev.map(bug => 
        bug.id === id 
          ? { 
              ...bug, 
              ...updates,
              fixedAt: updates.status === 'fixed' ? new Date() : bug.fixedAt
            }
          : bug
      );
      saveToLocalStorage(updated);
      return updated;
    });

    // Sincronizar com a nuvem se online
    if (isOnline) {
      setTimeout(() => syncToCloud(), 1000);
    }
  }, [isOnline]);

  const deleteBug = useCallback((id: string) => {
    setBugs(prev => {
      const updated = prev.filter(bug => bug.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });

    // Sincronizar com a nuvem se online
    if (isOnline) {
      setTimeout(() => syncToCloud(), 1000);
    }
  }, [isOnline]);

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
    syncFromCloud,
    syncToCloud,
  };
}
