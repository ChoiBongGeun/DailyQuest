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
      <div className="container-custom py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-3xl">D</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">{t('landing.hero.title')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 mb-8">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/signup')}
            >
              {t('landing.hero.cta')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/login')}
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
      <div className="container-custom py-20">
        <div className="text-center mb-12">
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
      <div className="container-custom py-20">
        <div className="bg-gradient-primary rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
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
