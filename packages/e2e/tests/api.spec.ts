import { test, expect } from '@playwright/test';

test.describe('API Server', () => {
  test('should have working health endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });

  test('should have working form data endpoint', async ({ request }) => {
    const response = await request.get("http://localhost:3001/api/forms");
    expect(response.ok()).toBeTruthy();
  });
});
