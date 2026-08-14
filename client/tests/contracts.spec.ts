import { test, expect } from '@playwright/test';

test.describe('Quản lý Hợp đồng', () => {
  test('Có thể truy cập và xem danh sách hợp đồng', async ({ page }) => {
    await page.goto('/contracts');
    await expect(page.getByRole('heading', { name: 'Hợp Đồng' })).toBeVisible();

    // Check table displays
    await expect(page.locator('table')).toBeVisible();
  });
});
