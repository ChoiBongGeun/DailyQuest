'use client';

import React from 'react';
import { Header } from '@/components/organisms/Header';
import { Sidebar } from '@/components/organisms/Sidebar';
import { StatsCard } from '@/components/molecules/StatsCard';
import { TaskItem } from '@/components/molecules/TaskItem';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  Filter
} from 'lucide-react';

export default function DashboardPage() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [showTaskModal, setShowTaskModal] = React.useState(false);

  // Mock data - 실제로는 API에서 가져와야 함
  const stats = {
    completed: 12,
    pending: 8,
    overdue: 2,
    completionRate: 60,
  };

  const recentTasks = [
    {
      id: 1,
      title: 'DailyQuest UI 개선',
      description: '모던하고 깔끔한 디자인으로 전면 개선',
      priority: 'HIGH' as const,
      dueDate: '2026-01-23',
      isCompleted: false,
      isRecurring: false,
      project: { id: 1, name: '개발', color: '#3b82f6' },
    },
    {
      id: 2,
      title: '백엔드 API 테스트',
      description: 'JWT 인증 및 CRUD 테스트',
      priority: 'MEDIUM' as const,
      dueDate: '2026-01-24',
      isCompleted: false,
      isRecurring: false,
      project: { id: 1, name: '개발', color: '#3b82f6' },
    },
    {
      id: 3,
      title: '운동하기',
      description: '헬스장 가기',
      priority: 'LOW' as const,
      isCompleted: true,
      isRecurring: true,
      recurrenceType: 'DAILY' as const,
      completedAt: '2026-01-22T09:00:00',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewTask={() => setShowTaskModal(true)}
        />

        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="container-custom max-w-7xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="heading-2 mb-2">대시보드</h1>
              <p className="text-neutral-600">오늘도 힘차게 시작해보세요! 🚀</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="완료한 할 일"
                value={stats.completed}
                icon={CheckCircle2}
                color="success"
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="진행 중"
                value={stats.pending}
                icon={Clock}
                color="primary"
              />
              <StatsCard
                title="지연됨"
                value={stats.overdue}
                icon={AlertCircle}
                color="danger"
              />
              <StatsCard
                title="완료율"
                value={`${stats.completionRate}%`}
                icon={TrendingUp}
                color="warning"
              />
            </div>

            {/* Tasks Section */}
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <h2 className="heading-3">오늘의 할 일</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
                    필터
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowTaskModal(true)}
                  >
                    새 할 일
                  </Button>
                </div>
              </div>

              {/* Task List */}
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task as any}
                      onToggle={(id) => console.log('Toggle task:', id)}
                      onEdit={(task) => console.log('Edit task:', task)}
                      onDelete={(id) => console.log('Delete task:', id)}
                    />
                  ))}
                </div>
              ) : (
                <Card padding="lg">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="heading-4 mb-2">할 일이 없습니다</h3>
                    <p className="text-neutral-600 mb-6">
                      새로운 할 일을 추가해보세요
                    </p>
                    <Button
                      variant="primary"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setShowTaskModal(true)}
                    >
                      할 일 추가
                    </Button>
                  </div>
                </Card>
              )}

              {/* Weekly Summary */}
              <Card>
                <h3 className="heading-4 mb-4">이번 주 요약</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">총 할 일</span>
                    <span className="font-semibold text-neutral-900">20개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">완료율</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary rounded-full"
                          style={{ width: '60%' }}
                        />
                      </div>
                      <span className="font-semibold text-primary-600">60%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
