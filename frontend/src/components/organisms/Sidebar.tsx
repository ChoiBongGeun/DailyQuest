'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  FolderKanban,
  Plus
} from 'lucide-react';
import { Button } from '../atoms/Button';

interface SidebarProps {
  currentView: 'dashboard' | 'today' | 'week' | 'all' | 'projects';
  onViewChange: (view: string) => void;
  onNewTask: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onNewTask,
}) => {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'today', label: '오늘', icon: CheckSquare },
    { id: 'week', label: '이번 주', icon: Calendar },
    { id: 'all', label: '전체', icon: FolderKanban },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* New Task Button */}
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onNewTask}
        >
          새 할 일
        </Button>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'text-sm font-medium',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-700 hover:bg-neutral-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              프로젝트
            </h3>
            <button className="p-1 rounded hover:bg-neutral-100 transition-colors">
              <Plus className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          <div className="space-y-1">
            {/* Example Projects - 실제로는 API에서 가져와야 함 */}
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-sm text-neutral-700">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>개인</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-sm text-neutral-700">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>업무</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
