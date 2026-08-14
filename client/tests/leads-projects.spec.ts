import { test, expect } from '@playwright/test';

test.describe('Cơ hội bán hàng (Leads & Projects)', () => {
  test('Có thể truy cập và xem trang Leads', async ({ page }) => {
    await page.goto('/leads');
    await expect(page.getByRole('heading', { name: 'Phễu Bán Hàng (Leads)' })).toBeVisible();

    // Test for add button presence (since it has no dialog implementation right now)
    await expect(page.getByRole('button', { name: 'Thêm Cơ Hội' })).toBeVisible();
  });
});
