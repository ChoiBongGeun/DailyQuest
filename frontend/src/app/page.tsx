'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { CheckCircle2, Calendar, TrendingUp, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: CheckCircle2,
      title: '간편한 할 일 관리',
      description: '직관적인 UI로 빠르게 할 일을 추가하고 관리하세요',
    },
    {
      icon: Calendar,
      title: '스마트 일정',
      description: '반복 일정과 마감일 알림으로 놓치지 마세요',
    },
    {
      icon: TrendingUp,
      title: '진행률 추적',
      description: '대시보드에서 한눈에 진행 상황을 파악하세요',
    },
    {
      icon: Zap,
      title: '빠르고 가벼운',
      description: '최적화된 성능으로 빠른 작업 처리',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="container-custom py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-3xl">D</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">DailyQuest</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 mb-8">
            매일의 목표를 달성하고 성취감을 느껴보세요
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/signup')}
            >
              무료로 시작하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/login')}
            >
              로그인
            </Button>
          </div>

          {/* Screenshot Preview */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-white p-1">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
              <p className="text-primary-600 font-medium">앱 스크린샷 미리보기</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom py-20">
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">핵심 기능</h2>
          <p className="text-neutral-600">
            DailyQuest의 강력한 기능을 경험해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                {/* 🔥 제목 색상 진하게 수정 */}
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container-custom py-20">
        <div className="bg-gradient-primary rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            무료로 DailyQuest를 사용하고 매일의 목표를 달성하세요
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push('/signup')}
          >
            무료 회원가입
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="container-custom text-center text-neutral-600">
          <p>© 2026 DailyQuest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
