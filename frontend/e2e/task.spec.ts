import { test, expect } from '@playwright/test';
import { signupAndLogin, loginAs } from './helpers/auth';

const suffix = Date.now();
const EMAIL = `task+${suffix}@e2e.test`;
const PASSWORD = 'TestPass123';

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await signupAndLogin(page, EMAIL, PASSWORD, 'TaskUser');
  await page.close();
});

test.beforeEach(async ({ page }) => {
  await loginAs(page, EMAIL, PASSWORD);
});

test.describe('태스크 CRUD', () => {
  test('새 할 일 생성 후 목록에 표시됨', async ({ page }) => {
    const title = `E2E 태스크 ${suffix}`;

    await page.getByRole('main').getByRole('button', { name: '새 할 일' }).click();
    await page.getByLabel('제목').fill(title);
    await page.getByRole('button', { name: '제출' }).click();

    await expect(page.getByText(title)).toBeVisible();
  });

  test('할 일 완료 처리', async ({ page }) => {
    const title = `완료 테스트 ${suffix}`;

    await page.getByRole('main').getByRole('button', { name: '새 할 일' }).click();
    await page.getByLabel('제목').fill(title);
    await page.getByRole('button', { name: '제출' }).click();
    await expect(page.getByText(title)).toBeVisible();

    const taskItem = page.locator('[data-testid="task-item"]').filter({ hasText: title });
    await taskItem.getByLabel('완료').click();

    await expect(taskItem).toHaveClass(/opacity-60/);
  });

  test('할 일 삭제', async ({ page }) => {
    const title = `삭제 테스트 ${suffix}`;

    await page.getByRole('main').getByRole('button', { name: '새 할 일' }).click();
    await page.getByLabel('제목').fill(title);
    await page.getByRole('button', { name: '제출' }).click();
    await expect(page.getByText(title)).toBeVisible();

    const taskItem = page.locator('[data-testid="task-item"]').filter({ hasText: title });
    await taskItem.getByLabel('더 보기').click();
    await page.getByRole('button', { name: '삭제' }).click();
    await page.getByRole('button', { name: '확인' }).click();

    await expect(page.getByText(title)).not.toBeVisible();
  });
});
