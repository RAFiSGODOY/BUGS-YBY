import { useState, useEffect } from 'react';
import { Bug, BugCategory } from '../types/Bug';

const STORAGE_KEY = 'yby-bugs';

export function useBugs() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [activeFilter, setActiveFilter] = useState<BugCategory | 'todos'>('todos');

  // Carrega bugs do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedBugs = JSON.parse(stored).map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined
        }));
        setBugs(parsedBugs);
      }
    } catch (error) {
      console.error('Erro ao carregar bugs:', error);
    }
  }, []);

  // Salva bugs no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bugs));
    } catch (error) {
      console.error('Erro ao salvar bugs:', error);
    }
  }, [bugs]);

  const addBug = (bugData: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bugData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    setBugs(prev => [newBug, ...prev]);
  };

  const updateBug = (id: string, updates: Partial<Bug>) => {
    setBugs(prev => prev.map(bug => 
      bug.id === id 
        ? { 
            ...bug, 
            ...updates,
            fixedAt: updates.isFixed !== undefined 
              ? (updates.isFixed ? new Date() : undefined)
              : bug.fixedAt
          }
        : bug
    ));
  };

  const deleteBug = (id: string) => {
    setBugs(prev => prev.filter(bug => bug.id !== id));
  };

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
    stats
  };
}