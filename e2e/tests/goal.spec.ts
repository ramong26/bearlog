import { test, expect } from '@playwright/test';
import fs from 'fs';
import { TEST_DATA_FILE } from '../constants';

let goalId: number;
let todoId: number;

test.beforeAll(() => {
  ({ goalId, todoId } = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf-8')));
});

test.beforeEach(async ({ page, request }) => {
  const todoRes = await request.get(`/api/proxy/todos/${todoId}`);
  expect(todoRes.ok()).toBeTruthy();
  const todo = await todoRes.json();

  if (todo.done) {
    const resetDoneRes = await request.patch(`/api/proxy/todos/${todoId}`, {
      data: { done: false },
    });
    expect(resetDoneRes.ok()).toBeTruthy();
  }

  await expect
    .poll(async () => {
      const currentRes = await request.get(`/api/proxy/todos/${todoId}`);
      if (!currentRes.ok()) return null;
      const currentTodo = await currentRes.json();
      return currentTodo.done;
    })
    .toBe(false);

  await page.goto(`/goal/${goalId}`);
  await expect(page).toHaveURL(`/goal/${goalId}`);
  await expect(page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first()).toBeVisible();
});

test.describe('목표 페이지 E2E', () => {
  test.describe.configure({ mode: 'serial' });

  test('목표 상세 정보와 할일 섹션이 표시된다', async ({ page, request }) => {
    const [goalRes, todoRes] = await Promise.all([
      request.get(`/api/proxy/goals/${goalId}`),
      request.get(`/api/proxy/todos/${todoId}`),
    ]);

    expect(goalRes.ok()).toBeTruthy();
    expect(todoRes.ok()).toBeTruthy();

    const goal = await goalRes.json();
    const todo = await todoRes.json();

    await expect(page.locator('main').getByText(goal.title, { exact: false }).first()).toBeVisible();
    await expect(page.getByText('TO DO').first()).toBeVisible();
    await expect(page.getByText('DONE').first()).toBeVisible();
    await expect(page.locator('main').getByText(todo.title, { exact: false }).first()).toBeVisible();
  });

  test('노트 모아보기 링크 클릭시 노트 목록으로 이동한다', async ({ page }) => {
    const noteListLink = page.locator(`a[href="/goal/${goalId}/note"]`).first();
    await noteListLink.click({ position: { x: 8, y: 8 } });
    await expect(page).toHaveURL(`/goal/${goalId}/note`);
  });

  test('할일 체크박스 클릭시 done 상태가 토글된다', async ({ page }) => {
    const noteCreateLink = page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first();
    const todoItem = noteCreateLink.locator('xpath=ancestor::li[1]');
    const checkbox = todoItem.getByRole('checkbox');

    const beforeChecked = await checkbox.getAttribute('aria-checked');
    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-checked', beforeChecked === 'true' ? 'false' : 'true');
  });

  test('할일 제목 클릭시 상세 모달이 열린다', async ({ page, request }) => {
    const todoRes = await request.get(`/api/proxy/todos/${todoId}`);
    expect(todoRes.ok()).toBeTruthy();
    const todo = await todoRes.json();

    const noteCreateLink = page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first();
    const todoItem = noteCreateLink.locator('xpath=ancestor::li[1]');
    const titleButton = todoItem.getByRole('button', { name: todo.title }).first();

    await titleButton.click();
    await expect(page.locator('div[class*="bg-black/50"]')).toBeVisible();
    await expect(page.locator('span.text-xl.font-semibold').filter({ hasText: todo.title })).toBeVisible();
  });

  test('캘린더 버튼 클릭시 캘린더 페이지로 이동한다', async ({ page }) => {
    await page.locator('main a[href="/calendar"]').first().click();
    await expect(page).toHaveURL(`/calendar`);
  });
});
