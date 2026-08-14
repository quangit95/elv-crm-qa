import { test, expect } from '@playwright/test';

test.describe('Core & Settings', () => {
  test('Có thể truy cập Dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Tổng Cơ Hội (Leads)')).toBeVisible();
  });

  test('Có thể truy cập Cài đặt công ty', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Thông tin công ty' })).toBeVisible();
    
    // Kiểm tra có trường Tên công ty không
    await expect(page.locator('div').filter({ hasText: /^Tên công ty$/ }).locator('input')).toBeVisible();
  });
});
