import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const testEmail = `test-${timestamp}@example.com`;
  const testPassword = 'Test@123456';

  test('full signup, login, profile edit, and logout flow', async ({ page }) => {
    // Step 1: Register
    await page.goto('/auth/register');
    await expect(page.locator('h1')).toContainText('Create Account');

    await page.fill('input[placeholder="John"]', 'E2E');
    await page.fill('input[placeholder="Doe"]', 'Tester');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);

    // Find confirm password field by locating all password fields
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[1].fill(testPassword);

    // Click register button
    await page.click('button:has-text("Create Account")');

    // Should redirect to login
    await page.waitForURL('/auth/login*');
    await expect(page.locator('h1')).toContainText('Sign In');

    // Step 2: Login with registered credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');

    // Should redirect to home and be authenticated (wait longer for Credentials provider to process)
    await page.waitForURL('/', { timeout: 60000 });
    await expect(page.locator('header')).toContainText(testEmail);

    // Step 3: Edit profile
    await page.goto('/settings');
    await expect(page.locator('h1, h2, h3')).toContainText(/Settings|Profile/i);

    // Fill profile edit form
    await page.fill('input#pf-first', 'UpdatedFirst');
    await page.fill('input#pf-last', 'UpdatedLast');
    // Email can stay the same
    await page.click('button:has-text("Save profile")');

    // Wait for success and reload
    await page.waitForTimeout(1500);

    // Step 4: Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL('/landing', { timeout: 30000 });

    // Verify not logged in anymore
    await page.goto('/');
    await page.waitForURL('/auth/login', { timeout: 30000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('password reset flow', async ({ page }) => {
    // First register a user
    const resetEmail = `reset-${timestamp}@example.com`;
    await page.goto('/auth/register');
    await page.fill('input[placeholder="John"]', 'Reset');
    await page.fill('input[placeholder="Doe"]', 'Test');
    await page.fill('input[type="email"]', resetEmail);
    await page.fill('input[placeholder="••••••••"]', 'oldpass123');
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[1].fill('oldpass123');
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('/auth/login*');

    // Now go to forgot password
    await page.goto('/auth/forgot-password');
    await expect(page.locator('h1')).toContainText('Forgot Password');

    // Request reset
    await page.fill('input[type="email"]', resetEmail);
    await page.click('button:has-text("Send Reset Link")');

    // In test mode, we display the link directly
    await page.waitForTimeout(1000);
    const resetLink = await page.locator('a[href*="/auth/reset?token="]').getAttribute('href');
    expect(resetLink).toBeTruthy();

    if (resetLink) {
      await page.goto(resetLink);
      await page.waitForTimeout(500);
      await page.fill('input#password', 'newpass123');
      await page.fill('input#confirmPassword', 'newpass123');
      await page.click('button:has-text("Reset Password")');

      // Wait for success message and redirect
      await page.waitForURL('/auth/login', { timeout: 60000 });

      // Try login with new password
      await page.fill('input[type="email"]', resetEmail);
      await page.fill('input[type="password"]', 'newpass123');
      await page.click('button:has-text("Sign In")');
      await page.waitForURL('/', { timeout: 60000 });
    }
  });

  test('login form validation', async ({ page }) => {
    await page.goto('/auth/login');

    // Try empty submit
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(500);

    // Try invalid password
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button:has-text("Sign In")');

    // Should show error (wait a bit for async validation)
    await page.waitForTimeout(1000);
    const errorElements = await page.locator('[class*="error"], [class*="red"], [role="alert"]').all();
    expect(errorElements.length).toBeGreaterThan(0);
  });

  test('register form validation', async ({ page }) => {
    await page.goto('/auth/register');

    // Try empty submit
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);

    // Try short password
    await page.fill('input[placeholder="John"]', 'Test');
    await page.fill('input[placeholder="Doe"]', 'User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', '123');
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[1].fill('123');
    await page.click('button:has-text("Create Account")');

    // Should show validation error
    await page.waitForTimeout(500);
    await expect(page.locator('text=at least 6 characters')).toBeVisible();
  });
});
