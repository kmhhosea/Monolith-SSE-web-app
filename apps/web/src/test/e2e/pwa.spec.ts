import { expect, test } from '@playwright/test';

test('landing page and manifest are reachable', async ({ page, request }) => {
  const landingResponse = await request.get('/');
  expect(landingResponse.ok()).toBeTruthy();

  const html = await landingResponse.text();
  await page.setContent(html);
  await expect(page.getByText("A digital home for students building Tanzania's future together.")).toBeVisible();

  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();

  const loginLink = page.getByRole('link', { name: 'Sign in' });
  await expect(loginLink).toBeVisible();
});
