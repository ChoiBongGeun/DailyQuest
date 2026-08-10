import type { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('**/dashboard');
}

export async function signupAndLogin(
  page: Page,
  email: string,
  password: string,
  nickname: string,
) {
  await page.goto('/signup');
  await page.fill('input[type="email"]', email);
  await page.getByPlaceholder('홍길동').fill(nickname);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('input[type="password"]').last().fill(password);
  await page.getByRole('button', { name: '회원가입' }).click();
  await page.waitForURL('**/dashboard');
}
