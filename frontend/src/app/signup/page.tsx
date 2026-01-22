'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { isValidEmail, isStrongPassword } from '@/lib/utils';

export default function SignUpPage() {
  const router = useRouter();
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
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!isStrongPassword(formData.password)) {
      newErrors.password = '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.';
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
      setErrors({ submit: error.message || '회원가입에 실패했습니다.' });
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
          <h1 className="text-3xl font-bold gradient-text mb-2">DailyQuest</h1>
          <p className="text-neutral-600">새로운 계정을 만들어보세요</p>
        </div>

        {/* SignUp Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email}
              required
              fullWidth
            />

            <Input
              label="닉네임"
              type="text"
              placeholder="홍길동"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              leftIcon={<User className="w-5 h-5" />}
              error={errors.nickname}
              helperText="2자 이상 입력해주세요"
              required
              fullWidth
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password}
              helperText="8자 이상, 영문과 숫자 포함"
              required
              fullWidth
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="••••••••"
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
              회원가입
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-8">
          © 2026 DailyQuest. All rights reserved.
        </p>
      </div>
    </div>
  );
}
