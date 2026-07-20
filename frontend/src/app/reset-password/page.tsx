'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { authApi } from '@/lib/api/auth';
import { extractErrorMessage } from '@/lib/api/response';
import { isStrongPassword } from '@/lib/utils';
import { DarkModeToggle } from '@/components/atoms/DarkModeToggle';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get('token') || '';
  const [formData, setFormData] = React.useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!token) {
      nextErrors.submit = t('auth.resetTokenMissing');
    }

    if (!isStrongPassword(formData.password)) {
      nextErrors.password = t('auth.passwordError');
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = t('auth.passwordMismatch');
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsLoading(true);
      await authApi.resetPassword({
        token,
        newPassword: formData.password,
      });
      setIsComplete(true);
    } catch (error) {
      setErrors({ submit: extractErrorMessage(error, t('error.generic')) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-8 sm:py-12 transition-colors">
      <div className="absolute right-4 top-4">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('common.appName')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{t('auth.resetPasswordDesc')}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-transparent dark:border-neutral-800 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-5 sm:mb-6">
            {t('auth.resetPasswordTitle')}
          </h2>

          {isComplete ? (
            <div className="space-y-5">
              <div className="bg-success-light text-success text-sm p-3 rounded-lg">
                {t('auth.passwordResetSuccess')}
              </div>
              <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/login')}>
                {t('auth.login')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('auth.newPassword')}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password}
                helperText={t('auth.passwordHelp')}
                required
                fullWidth
              />

              <Input
                label={t('auth.passwordConfirm')}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.confirmPassword}
                required
                fullWidth
              />

              {errors.submit && (
                <div className="bg-error-light text-error text-sm p-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                {t('auth.resetPassword')}
              </Button>

              <Link href="/login" className="block text-center text-sm text-primary-600 font-medium hover:text-primary-700">
                {t('auth.backToLogin')}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" />}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
