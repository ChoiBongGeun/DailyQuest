'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ submit: error.message || t('auth.loginError') });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('common.appName')}</h1>
          <p className="text-neutral-600">{t('common.appDescription')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">{t('auth.loginTitle')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-5 h-5" />}
              required
              fullWidth
            />

            <Input
              label={t('auth.password')}
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="w-5 h-5" />}
              required
              fullWidth
            />

            {errors.submit && (
              <div className="bg-error-light text-error text-sm p-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              {t('auth.login')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              {t('auth.noAccount')}{' '}
              <Link
                href="/signup"
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                {t('auth.signup')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-8">
          {t('landing.footer.copyright')}
        </p>
      </div>
    </div>
  );
}
