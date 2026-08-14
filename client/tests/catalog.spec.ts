import { test, expect } from '@playwright/test';

test.describe('Quản lý Danh mục Vật tư', () => {
  test('Có thể thêm vật tư mới và hiển thị trong danh sách', async ({ page }) => {
    await page.goto('/catalog');
    
    await page.getByRole('button', { name: 'Thêm Vật Tư' }).click();
    await expect(page.getByRole('heading', { name: 'Thêm Vật Tư / Nhân Công Mới' })).toBeVisible();

    const uniqueSuffix = Date.now().toString();
    const testName = `Sản phẩm Test ${uniqueSuffix}`;
    
    // Fill out form
    await page.locator('div').filter({ hasText: /^Tên vật tư \(\*\)$/ }).locator('input').fill(testName);
    await page.locator('div').filter({ hasText: /^Mã \/ Model$/ }).locator('input').fill(`TEST-${uniqueSuffix}`);
    await page.locator('div').filter({ hasText: /^Giá vốn \(\*\)$/ }).locator('input').fill('500000');
    await page.locator('div').filter({ hasText: /^Giá bán niêm yết \(\*\)$/ }).locator('input').fill('1000000');
    await page.locator('div').filter({ hasText: /^Đơn vị tính$/ }).locator('input').fill('Cái');
    
    // Chọn danh mục đầu tiên (nếu có)
    const selects = page.locator('select');
    await selects.nth(0).selectOption({ index: 1 });

    await page.getByRole('button', { name: 'Lưu lại' }).click();

    // Check successful creation
    await expect(page.getByRole('heading', { name: 'Thêm Vật Tư / Nhân Công Mới' })).not.toBeVisible();
    await expect(page.getByText(testName)).toBeVisible();
  });
});
