import { useState, useEffect, useCallback } from 'react';
import { Bug, BugCategory } from '../types/Bug';
import { apiService } from '../services/api';
import { API_CONFIG } from '../config/api';

export function useBugsSync() {
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
    }, API_CONFIG.SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(API_CONFIG.BUGS_STORAGE_KEY);
      if (stored) {
        const parsedBugs = JSON.parse(stored).map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined
        }));
        setBugs(parsedBugs);
      }
    } catch (error) {
      console.error('Erro ao carregar bugs do localStorage:', error);
    }
  };

  const saveToLocalStorage = (bugsToSave: Bug[]) => {
    try {
      localStorage.setItem(API_CONFIG.BUGS_STORAGE_KEY, JSON.stringify(bugsToSave));
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
    
    console.log('🔄 Iniciando sincronização para a nuvem...', { bugsCount: bugsToSync.length });
    setIsSyncing(true);
    try {
      const response = await apiService.updateBin(bugsToSync);
      if (response.success) {
        setLastSync(new Date());
        console.log('✅ Bugs sincronizados para a nuvem:', response.data);
      } else {
        console.error('❌ Erro ao sincronizar para a nuvem:', response.error);
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

    console.log('🔄 Iniciando sincronização da nuvem...');
    setIsSyncing(true);
    try {
      const response = await apiService.getBin();
      if (response.success && response.data) {
        // Verificar se response.data é um array
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const cloudBugs = dataArray.map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined
        }));

        // Mesclar bugs locais com os da nuvem
        const mergedBugs = mergeBugs(bugs, cloudBugs);
        setBugs(mergedBugs);
        saveToLocalStorage(mergedBugs);
        setLastSync(new Date());
        console.log('✅ Bugs sincronizados da nuvem:', { 
          localBugs: bugs.length, 
          cloudBugs: cloudBugs.length, 
          mergedBugs: mergedBugs.length 
        });
      } else {
        console.log('ℹ️ Nenhum dado na nuvem ou erro:', response.error);
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar da nuvem:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const mergeBugs = (localBugs: Bug[], cloudBugs: Bug[]): Bug[] => {
    const bugMap = new Map<string, Bug>();

    // Adicionar bugs locais
    localBugs.forEach(bug => bugMap.set(bug.id, bug));

    // Adicionar/atualizar com bugs da nuvem
    cloudBugs.forEach(cloudBug => {
      const localBug = bugMap.get(cloudBug.id);
      if (!localBug || new Date(cloudBug.createdAt) > new Date(localBug.createdAt)) {
        bugMap.set(cloudBug.id, cloudBug);
      }
    });

    return Array.from(bugMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const addBug = useCallback((bugData: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bugData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    console.log('➕ Adicionando novo bug:', newBug);
    const updatedBugs = [newBug, ...bugs];
    setBugs(updatedBugs);
    saveToLocalStorage(updatedBugs);

    // Sincronizar imediatamente se online
    if (isOnline) {
      console.log('🔄 Agendando sincronização após adicionar bug...');
      setTimeout(() => syncToCloud(), 1000);
    } else {
      console.log('📱 Offline - bug salvo localmente');
    }
  }, [bugs, isOnline]);

  const updateBug = useCallback((id: string, updates: Partial<Bug>) => {
    const updatedBugs = bugs.map(bug => 
      bug.id === id 
        ? { 
            ...bug, 
            ...updates,
            fixedAt: updates.isFixed !== undefined 
              ? (updates.isFixed ? new Date() : undefined)
              : bug.fixedAt
          }
        : bug
    );

    setBugs(updatedBugs);
    saveToLocalStorage(updatedBugs);

    // Sincronizar imediatamente se online
    if (isOnline) {
      setTimeout(() => syncToCloud(), 1000);
    }
  }, [bugs, isOnline]);

  const deleteBug = useCallback((id: string) => {
    const updatedBugs = bugs.filter(bug => bug.id !== id);
    setBugs(updatedBugs);
    saveToLocalStorage(updatedBugs);

    // Sincronizar imediatamente se online
    if (isOnline) {
      setTimeout(() => syncToCloud(), 1000);
    }
  }, [bugs, isOnline]);

  const filteredBugs = activeFilter === 'todos' 
    ? bugs 
    : bugs.filter(bug => bug.category === activeFilter);

  const stats = {
    total: bugs.length,
    fixed: bugs.filter(bug => bug.isFixed).length,
    pending: bugs.filter(bug => !bug.isFixed).length,
    byCategory: bugs.reduce((acc, bug) => {
      acc[bug.category] = (acc[bug.category] || 0) + 1;
      return acc;
    }, {} as Record<BugCategory, number>)
  };

  return {
    bugs: filteredBugs,
    allBugs: bugs,
    activeFilter,
    setActiveFilter,
    addBug,
    updateBug,
    deleteBug,
    stats,
    isOnline,
    lastSync,
    isSyncing,
    syncToCloud,
    syncFromCloud
  };
}
