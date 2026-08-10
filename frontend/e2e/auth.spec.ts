import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers/auth';

const suffix = Date.now();

test.describe('인증', () => {
  test('로그인 - 잘못된 이메일 형식 입력 시 유효성 오류 표시', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'not-an-email');
    await page.fill('input[type="password"]', 'anypassword');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page.getByText('올바른 이메일 형식이 아닙니다.')).toBeVisible();
  });

  test('로그인 - 존재하지 않는 계정으로 로그인 시 에러 표시', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', `nonexist+${suffix}@e2e.test`);
    await page.fill('input[type="password"]', 'WrongPass123');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(
      page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.'),
    ).toBeVisible();
  });

  test('회원가입 - 약한 비밀번호 입력 시 유효성 오류 표시', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[type="email"]', `weak+${suffix}@e2e.test`);
    await page.getByPlaceholder('홍길동').fill('테스터');
    await page.locator('input[type="password"]').first().fill('weak');
    await page.locator('input[type="password"]').last().fill('weak');
    await page.getByRole('button', { name: '회원가입' }).click();
    await expect(
      page.getByText('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.'),
    ).toBeVisible();
  });

  test('회원가입 - 비밀번호 불일치 시 에러 표시', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[type="email"]', `mismatch+${suffix}@e2e.test`);
    await page.getByPlaceholder('홍길동').fill('테스터');
    await page.locator('input[type="password"]').first().fill('ValidPass1');
    await page.locator('input[type="password"]').last().fill('Different1');
    await page.getByRole('button', { name: '회원가입' }).click();
    await expect(page.getByText('비밀번호가 일치하지 않습니다.')).toBeVisible();
  });

  test('회원가입 성공 후 대시보드로 이동', async ({ page }) => {
    await signupAndLogin(
      page,
      `signup+${suffix}@e2e.test`,
      'TestPass123',
      'E2EUser',
    );
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
