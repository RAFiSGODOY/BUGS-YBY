import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { BugCategory, Priority, BUG_CATEGORIES, PRIORITIES, Platform, PLATFORMS } from '../types/Bug';
import { ScreenshotCapture } from './ScreenshotCapture';
import { getDeviceInfo, detectPlatform } from '../utils/platform';

interface BugFormProps {
  onAdd: (bug: {
    title: string;
    description: string;
    category: BugCategory;
    priority: Priority;
    isFixed: boolean;
    screenshot?: string;
    platform?: Platform;
    deviceInfo?: string;
  }) => Promise<void>;
}

export function BugForm({ onAdd }: BugFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BugCategory>('interface');
  const [priority, setPriority] = useState<Priority>('media');
  const [screenshot, setScreenshot] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>(detectPlatform());
  const [deviceInfo] = useState<string>(getDeviceInfo());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        isFixed: false,
        screenshot: screenshot || undefined,
        platform,
        deviceInfo
      });

      setTitle('');
      setDescription('');
      setCategory('interface');
      setPriority('media');
      setScreenshot('');
      setPlatform(detectPlatform());
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Erro ao criar bug:', error);
    } finally {
      setIsSubmitting(false);
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          Adicionar Novo Bug
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Novo Bug</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título do Bug
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Descreva brevemente o bug..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Descreva o bug em detalhes..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as BugCategory)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {Object.entries(BUG_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {Object.entries(PRIORITIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma
              <span className="text-xs text-gray-500 ml-1">(detectada automaticamente)</span>
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {Object.entries(PLATFORMS).map(([key, { label, icon }]) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Você pode alterar se necessário
            </p>
          </div>
        </div>


        {/* Captura de Screenshot */}
        <ScreenshotCapture
          onScreenshot={setScreenshot}
          currentScreenshot={screenshot}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 px-6 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2 ${
              isSubmitting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isSubmitting ? 'Criando...' : 'Adicionar Bug'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}