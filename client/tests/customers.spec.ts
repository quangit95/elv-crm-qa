import { test, expect } from '@playwright/test';

test.describe('Quản lý Khách Hàng', () => {
  test('Có thể thêm khách hàng mới và hiển thị trong danh sách', async ({ page }) => {
    await page.goto('/customers');
    
    // Đảm bảo trang đã load
    await expect(page.getByRole('heading', { name: 'Khách Hàng' })).toBeVisible();

    // Click nút Thêm Khách Hàng
    await page.getByRole('button', { name: 'Thêm Khách Hàng' }).click();
    await expect(page.getByRole('heading', { name: 'Thêm khách hàng mới' })).toBeVisible();

    const uniqueSuffix = Date.now().toString();
    const customerName = `Khách hàng Playwright ${uniqueSuffix}`;
    
    // Điền form
    await page.locator('div').filter({ hasText: /^Tên khách hàng \(\*\)$/ }).locator('input').fill(customerName);
    await page.locator('div').filter({ hasText: /^Số điện thoại$/ }).locator('input').fill('0901234567');
    await page.locator('div').filter({ hasText: /^Email$/ }).locator('input').fill(`test${uniqueSuffix}@example.com`);
    await page.locator('div').filter({ hasText: /^Địa chỉ$/ }).locator('input').fill('123 Đường Test, Quận 1');
    
    // Lưu lại
    await page.getByRole('button', { name: 'Lưu thông tin' }).click();

    // Dialog biến mất
    await expect(page.getByRole('heading', { name: 'Thêm khách hàng mới' })).not.toBeVisible();
    
    // Kiểm tra khách hàng mới có trong bảng
    await expect(page.getByText(customerName).first()).toBeVisible();
    await expect(page.getByText('0901234567').first()).toBeVisible();
  });
});
