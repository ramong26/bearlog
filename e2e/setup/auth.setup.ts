import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { AUTH_FILE, TEST_DATA_FILE } from '../constants';

setup('로그인 후 인증 상태 저장', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[type="email"]', process.env.E2E_EMAIL!);
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD!);
  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard');

  // goal 생성
  const goalRes = await page.request.post('/api/proxy/goals', {
    data: { title: '[E2E] 테스트 목표' },
  });
  expect(goalRes.ok()).toBeTruthy();
  const goal = await goalRes.json();

  // todo 생성
  const todoRes = await page.request.post('/api/proxy/todos', {
    data: { title: '[E2E] 테스트 할일', goalId: goal.id },
  });
  expect(todoRes.ok()).toBeTruthy();
  const todo = await todoRes.json();

  // IDs 파일로 저장
  fs.mkdirSync(path.dirname(TEST_DATA_FILE), { recursive: true });
  fs.writeFileSync(TEST_DATA_FILE, JSON.stringify({ goalId: goal.id, todoId: todo.id }));

  await page.context().storageState({ path: AUTH_FILE });
});
