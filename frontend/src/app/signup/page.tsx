'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { isValidEmail, isStrongPassword } from '@/lib/utils';

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signup, isLoading } = useAuthStore();
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isValidEmail(formData.email)) {
      newErrors.email = t('auth.emailError');
    }

    if (!isStrongPassword(formData.password)) {
      newErrors.password = t('auth.passwordError');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
    }

    if (formData.nickname.length < 2) {
      newErrors.nickname = t('auth.nicknameError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      });
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ submit: error.message || t('auth.signupError') });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('common.appName')}</h1>
          <p className="text-neutral-600">{t('auth.createAccount')}</p>
        </div>

        {/* SignUp Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">{t('auth.signupTitle')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              label={t('auth.nickname')}
              type="text"
              placeholder={t('auth.nicknamePlaceholder')}
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              leftIcon={<User className="w-5 h-5" />}
              error={errors.nickname}
              helperText={t('auth.nicknameHelp')}
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              {t('auth.signup')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              {t('auth.hasAccount')}{' '}
              <Link
                href="/login"
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                {t('auth.login')}
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
