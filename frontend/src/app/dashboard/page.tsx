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
import { useTodayTasks, useToggleTask, useDeleteTask } from '@/hooks/use-tasks';
import { useDashboardStats } from '@/hooks/use-dashboard';

export default function Page() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [showTaskModal, setShowTaskModal] = React.useState(false);

  // 🔥 실제 API 데이터 가져오기
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useTodayTasks();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const handleToggle = async (id: number) => {
    try {
      await toggleTask.mutateAsync(id);
    } catch (error) {
      console.error('할 일 토글 실패:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteTask.mutateAsync(id);
      } catch (error) {
        console.error('할 일 삭제 실패:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
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
              <h1 className="heading-2 text-neutral-900 dark:text-neutral-100 mb-2">대시보드</h1>
              <p className="text-neutral-600 dark:text-neutral-400">오늘도 힘차게 시작해보세요! 🚀</p>
            </div>

            {/* Stats Grid */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-xl" />
                ))}
              </div>
            ) : statsError ? (
              <div className="bg-error-light dark:bg-error/20 border border-error/20 text-error dark:text-error-light p-4 rounded-lg mb-8">
                통계를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="완료한 할 일"
                  value={stats.completedTasks}
                  icon={CheckCircle2}
                  color="success"
                />
                <StatsCard
                  title="진행 중"
                  value={stats.pendingTasks}
                  icon={Clock}
                  color="primary"
                />
                <StatsCard
                  title="지연됨"
                  value={stats.overdueTasks}
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
            ) : null}

            {/* Tasks Section */}
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <h2 className="heading-3 text-neutral-900 dark:text-neutral-100">오늘의 할 일</h2>
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
              {tasksLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-lg" />
                  ))}
                </div>
              ) : tasksError ? (
                <Card padding="lg" className="border-error/20">
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
                    <h3 className="heading-4 text-neutral-900 dark:text-neutral-100 mb-2">
                      할 일을 불러올 수 없습니다
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      백엔드 서버가 실행 중인지 확인해주세요.
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500">
                      서버 주소: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}
                    </p>
                  </div>
                </Card>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={(task) => console.log('Edit task:', task)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <Card padding="lg">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="heading-4 text-neutral-900 dark:text-neutral-100 mb-2">
                      할 일이 없습니다
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
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
              {stats && (
                <Card>
                  <h3 className="heading-4 text-neutral-900 dark:text-neutral-100 mb-4">
                    이번 주 요약
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">총 할 일</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {stats.thisWeekTasks || stats.totalTasks}개
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">완료율</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary rounded-full transition-all"
                            style={{ width: `${stats.completionRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          {stats.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
