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

  // Configurar sincronização em tempo real
  useEffect(() => {
    if (!isOnline) return;

    console.log('🔄 Configurando sincronização em tempo real...');
    
    // Carregar dados iniciais da nuvem
    loadFromCloud();

    // Configurar WebSocket para tempo real (simulado com polling otimizado)
    const realtimeInterval = setInterval(() => {
      syncFromCloud();
    }, 2000); // Sincronização a cada 2 segundos

    return () => {
      clearInterval(realtimeInterval);
      console.log('⏹️ Sincronização em tempo real desativada');
    };
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

  const loadFromCloud = async () => {
    if (!isOnline) return;

    console.log('☁️ Carregando bugs da nuvem...');
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

        // Mesclar bugs locais com os da nuvem
        const mergedBugs = mergeBugs(bugs, cloudBugs);
        setBugs(mergedBugs);
        saveToLocalStorage(mergedBugs);
        setLastSync(new Date());
        console.log('✅ Bugs carregados da nuvem:', { 
          localBugs: bugs.length, 
          cloudBugs: cloudBugs.length, 
          mergedBugs: mergedBugs.length 
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar da nuvem:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromCloud = async () => {
    if (!isOnline || isSyncing) return;

    try {
      const response = await supabaseService.getBugs();
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const cloudBugs = dataArray.map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined,
        }));

        // Verificar se há mudanças
        const hasChanges = checkForChanges(bugs, cloudBugs);
        if (hasChanges) {
          const mergedBugs = mergeBugs(bugs, cloudBugs);
          setBugs(mergedBugs);
          saveToLocalStorage(mergedBugs);
          setLastSync(new Date());
          console.log('🔄 Sincronização em tempo real:', { 
            localBugs: bugs.length, 
            cloudBugs: cloudBugs.length, 
            mergedBugs: mergedBugs.length 
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro na sincronização em tempo real:', error);
    }
  };

  const checkForChanges = (localBugs: Bug[], cloudBugs: Bug[]): boolean => {
    if (localBugs.length !== cloudBugs.length) return true;
    
    for (const cloudBug of cloudBugs) {
      const localBug = localBugs.find(b => b.id === cloudBug.id);
      if (!localBug || 
          localBug.isFixed !== cloudBug.isFixed ||
          localBug.title !== cloudBug.title ||
          localBug.description !== cloudBug.description) {
        return true;
      }
    }
    return false;
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

  const addBug = useCallback(async (bug: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bug,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Adicionar localmente primeiro
    setBugs(prev => {
      const updated = [newBug, ...prev];
      saveToLocalStorage(updated);
      return updated;
    });

    // Sincronizar com a nuvem imediatamente
    if (isOnline) {
      try {
        const response = await supabaseService.addBug(newBug);
        if (response.success) {
          console.log('✅ Bug adicionado à nuvem em tempo real');
          setLastSync(new Date());
        } else {
          console.error('❌ Erro ao adicionar bug à nuvem:', response.error);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar bug:', error);
      }
    }
  }, [isOnline]);

  const updateBug = useCallback(async (id: string, updates: Partial<Bug>) => {
    console.log('🔄 Iniciando atualização do bug:', { id, updates });
    let updatedBug: Bug | null = null;

    // Atualizar localmente primeiro
    setBugs(prev => {
      const updated = prev.map(bug => {
        if (bug.id === id) {
          updatedBug = { 
            ...bug, 
            ...updates,
            fixedAt: updates.isFixed ? new Date() : bug.fixedAt
          };
          console.log('📝 Bug atualizado localmente:', updatedBug);
          return updatedBug;
        }
        return bug;
      });
      saveToLocalStorage(updated);
      return updated;
    });

    // Sincronizar com a nuvem imediatamente
    if (isOnline && updatedBug) {
      try {
        console.log('☁️ Sincronizando atualização com a nuvem...');
        const response = await supabaseService.updateBug(updatedBug);
        if (response.success) {
          console.log('✅ Bug atualizado na nuvem em tempo real');
          setLastSync(new Date());
        } else {
          console.error('❌ Erro ao atualizar bug na nuvem:', response.error);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar atualização:', error);
      }
    } else {
      console.log('⏸️ Sincronização offline ou bug não encontrado');
    }
  }, [isOnline]);

  const deleteBug = useCallback(async (id: string) => {
    console.log('🗑️ Iniciando exclusão do bug:', { id });
    
    // Remover localmente primeiro
    setBugs(prev => {
      const updated = prev.filter(bug => bug.id !== id);
      console.log('📝 Bug removido localmente:', { id, remainingBugs: updated.length });
      saveToLocalStorage(updated);
      return updated;
    });

    // Sincronizar com a nuvem imediatamente
    if (isOnline) {
      try {
        console.log('☁️ Sincronizando exclusão com a nuvem...');
        const response = await supabaseService.deleteBug(id);
        if (response.success) {
          console.log('✅ Bug removido da nuvem em tempo real');
          setLastSync(new Date());
        } else {
          console.error('❌ Erro ao remover bug da nuvem:', response.error);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar remoção:', error);
      }
    } else {
      console.log('⏸️ Sincronização offline');
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
  };
}