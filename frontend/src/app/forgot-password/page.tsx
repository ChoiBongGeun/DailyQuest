'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { authApi } from '@/lib/api/auth';
import { extractErrorMessage } from '@/lib/api/response';
import { isValidEmail } from '@/lib/utils';
import { DarkModeToggle } from '@/components/atoms/DarkModeToggle';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError(t('auth.emailError'));
      return;
    }

    try {
      setIsLoading(true);
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (requestError) {
      setError(extractErrorMessage(requestError, t('error.generic')));
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
          <p className="text-neutral-600 dark:text-neutral-400">{t('auth.forgotPasswordDesc')}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-transparent dark:border-neutral-800 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-5 sm:mb-6">
            {t('auth.forgotPasswordTitle')}
          </h2>

          {sent ? (
            <div className="space-y-5">
              <div className="bg-success-light text-success text-sm p-3 rounded-lg">
                {t('auth.resetEmailSent')}
              </div>
              <Button variant="primary" size="lg" fullWidth onClick={() => setSent(false)}>
                {t('auth.sendAgain')}
              </Button>
              <Link href="/login" className="block text-center text-sm text-primary-600 font-medium hover:text-primary-700">
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('auth.email')}
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
                error={error}
                required
                fullWidth
              />

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                {t('auth.sendResetLink')}
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
