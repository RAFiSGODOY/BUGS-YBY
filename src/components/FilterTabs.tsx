import React from 'react';
import { BugCategory, BUG_CATEGORIES } from '../types/Bug';

interface FilterTabsProps {
  activeFilter: BugCategory | 'todos';
  onFilterChange: (filter: BugCategory | 'todos') => void;
  stats: Record<BugCategory, number>;
  totalCount: number;
}

export function FilterTabs({ activeFilter, onFilterChange, stats, totalCount }: FilterTabsProps) {
  const filters = [
    { key: 'todos' as const, label: 'Todos', count: totalCount },
    ...Object.entries(BUG_CATEGORIES).map(([key, label]) => ({
      key: key as BugCategory,
      label,
      count: stats[key as BugCategory] || 0
    }))
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 mb-6">
      <div className="flex flex-wrap gap-1">
        {filters.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
              activeFilter === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            {label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}