import { test, expect } from '@playwright/test';
import { signupAndLogin, loginAs } from './helpers/auth';

const suffix = Date.now();
const EMAIL = `proj+${suffix}@e2e.test`;
const PASSWORD = 'TestPass123';

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await signupAndLogin(page, EMAIL, PASSWORD, 'ProjUser');
  await page.close();
});

test.beforeEach(async ({ page }) => {
  await loginAs(page, EMAIL, PASSWORD);
});

test.describe('프로젝트 CRUD', () => {
  test('새 프로젝트 생성 후 사이드바에 표시됨', async ({ page }) => {
    const projectName = `E2E 프로젝트 ${suffix}`;

    await page.getByRole('button', { name: '새 프로젝트' }).click();
    await page.getByLabel('프로젝트 이름').fill(projectName);
    await page.getByRole('button', { name: '제출' }).click();

    await expect(page.getByRole('button', { name: projectName, exact: true })).toBeVisible();
  });

  test('프로젝트 상세 페이지 이동', async ({ page }) => {
    const projectName = `상세 테스트 ${suffix}`;

    await page.getByRole('button', { name: '새 프로젝트' }).click();
    await page.getByLabel('프로젝트 이름').fill(projectName);
    await page.getByRole('button', { name: '제출' }).click();
    await expect(page.getByRole('button', { name: projectName, exact: true })).toBeVisible();

    await page.getByRole('button', { name: projectName, exact: true }).click();
    await page.getByRole('button', { name: '상세 보기' }).click();

    await expect(page).toHaveURL(/\/dashboard\/projects\/\d+/);
    await expect(page.getByText(projectName).first()).toBeVisible();
  });

  test('프로젝트 삭제', async ({ page }) => {
    const projectName = `삭제 프로젝트 ${suffix}`;

    await page.getByRole('button', { name: '새 프로젝트' }).click();
    await page.getByLabel('프로젝트 이름').fill(projectName);
    await page.getByRole('button', { name: '제출' }).click();
    await expect(page.getByRole('button', { name: projectName, exact: true })).toBeVisible();

    await page.getByRole('button', { name: projectName, exact: true }).hover();
    await page.getByRole('button', { name: `프로젝트 삭제: ${projectName}` }).click();
    await page.getByRole('button', { name: '확인' }).click();

    await expect(page.getByRole('button', { name: projectName, exact: true })).not.toBeVisible();
  });
});
