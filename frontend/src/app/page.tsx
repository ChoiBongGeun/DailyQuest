'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms/Button';
import { CheckCircle2, Calendar, TrendingUp, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const features = [
    {
      icon: CheckCircle2,
      title: t('landing.features.simple.title'),
      description: t('landing.features.simple.desc'),
    },
    {
      icon: Calendar,
      title: t('landing.features.smart.title'),
      description: t('landing.features.smart.desc'),
    },
    {
      icon: TrendingUp,
      title: t('landing.features.tracking.title'),
      description: t('landing.features.tracking.desc'),
    },
    {
      icon: Zap,
      title: t('landing.features.fast.title'),
      description: t('landing.features.fast.desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="container-custom py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-primary-200">
              <span className="text-white font-bold text-2xl sm:text-3xl drop-shadow-sm">D</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">{t('landing.hero.title')}</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 mb-7 sm:mb-8">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 lg:mb-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/signup')}
              className="w-full sm:w-auto"
            >
              {t('landing.hero.cta')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto"
            >
              {t('landing.hero.login')}
            </Button>
          </div>

          {/* Screenshot Preview */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-white p-1">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
              <p className="text-primary-600 font-medium">{t('common.appName')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="heading-2 mb-4">{t('landing.features.title')}</h2>
          <p className="text-neutral-600">
            {t('landing.features.subtitle')}
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
      <div className="container-custom py-12 sm:py-16 lg:py-20">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 sm:p-10 lg:p-12 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 drop-shadow-sm">
            {t('landing.cta.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-7 sm:mb-8 text-primary-50">
            {t('landing.cta.subtitle')}
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push('/signup')}
          >
            {t('landing.cta.button')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="container-custom text-center text-neutral-600">
          <p>{t('landing.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
