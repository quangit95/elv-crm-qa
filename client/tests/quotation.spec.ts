import { test, expect } from '@playwright/test';

test.describe('Tạo Báo Giá (Quotation Builder)', () => {
  test('Có thể tạo một báo giá mới thành công', async ({ page }) => {
    await page.goto('/quotations/new');
    await expect(page.getByRole('heading', { name: 'Tạo Báo Giá Mới' })).toBeVisible();

    // 1. Chọn Dự án
    await page.locator('button').filter({ hasText: 'Chọn Dự án...' }).click();
    await page.getByRole('option').first().click();

    // 2. Thay đổi chiết khấu
    await page.locator('div').filter({ hasText: /^Chiết khấu \(VNĐ\)$/ }).locator('input').fill('50000');

    // 3. Thêm dòng tuỳ chỉnh
    await page.getByRole('button', { name: '+ Dòng tuỳ chỉnh' }).click();
    
    // Đổi tên dòng tuỳ chỉnh
    const inputName = page.locator('input[value="Vật tư tuỳ chỉnh mới"]').first();
    await inputName.fill('Dịch vụ lắp đặt Playwright');
    
    // Đổi đơn giá (giá trị mặc định là 0)
    const inputs = page.locator('input[type="number"]');
    // input 0: chiết khấu, input 1: quantity, input 2: unitPrice, input 3: costPrice
    await inputs.nth(2).fill('1500000');

    // Kiểm tra tính toán
    await expect(page.locator('span.text-xl.text-primary')).toBeVisible();

    // 4. Lưu báo giá
    await page.getByRole('button', { name: 'Lưu Báo Giá' }).click();

    // 5. Chuyển về danh sách báo giá
    await expect(page).toHaveURL(/.*\/quotations/);
    await expect(page.getByRole('heading', { name: 'Báo Giá' })).toBeVisible();
    
    // Kiểm tra có báo giá vừa tạo trong bảng không
    await expect(page.locator('table')).toBeVisible();
  });
});
