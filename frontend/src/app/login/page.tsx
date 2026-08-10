'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { extractErrorCode, extractHttpStatus } from '@/lib/api/response';
import { isValidEmail } from '@/lib/utils';
import { DarkModeToggle } from '@/components/atoms/DarkModeToggle';

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

    const nextErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      nextErrors.email = t('validation.required');
    } else if (!isValidEmail(formData.email)) {
      nextErrors.email = t('auth.emailError');
    }

    if (!formData.password) {
      nextErrors.password = t('validation.required');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error) {
      setErrors({ submit: getLoginErrorMessage(error, t) });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-8 sm:py-12 transition-colors">
      <div className="absolute right-4 top-4">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('common.appName')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{t('common.appDescription')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-transparent dark:border-neutral-800 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-5 sm:mb-6">{t('auth.loginTitle')}</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email}
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
              error={errors.password}
              required
              fullWidth
            />

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

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
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
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
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-500 mt-8">
          {t('landing.footer.copyright')}
        </p>
      </div>
    </div>
  );
}

function getLoginErrorMessage(error: unknown, t: (key: string) => string): string {
  const code = extractErrorCode(error);
  const status = extractHttpStatus(error);

  if (code === 401001 || status === 401) {
    return t('auth.invalidCredentials');
  }

  if (status === 400 || code === 400001) {
    return t('auth.loginValidationError');
  }

  if (!status) {
    return t('error.network');
  }

  if (status >= 500) {
    return t('error.serverError');
  }

  return t('auth.loginError');
}
