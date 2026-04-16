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

  if (todo.favorite) {
    const resetFavoriteRes = await request.patch(`/api/proxy/todos/${todoId}/favorite`);
    expect(resetFavoriteRes.ok()).toBeTruthy();
  }

  // 상태 변경이 반영될 때까지 폴링
  await expect
    .poll(async () => {
      const currentRes = await request.get(`/api/proxy/todos/${todoId}`);
      if (!currentRes.ok()) return null;
      const currentTodo = await currentRes.json();
      return { done: currentTodo.done, favorite: currentTodo.favorite };
    })
    .toEqual({ done: false, favorite: false });

  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first()).toBeVisible();
});

test.describe('대시보드 E2E', () => {
  test('생성된 목표와 할일이 대시보드에 표시된다', async ({ page, request }) => {
    const [goalRes, todoRes] = await Promise.all([
      request.get(`/api/proxy/goals/${goalId}`),
      request.get(`/api/proxy/todos/${todoId}`),
    ]);

    expect(goalRes.ok()).toBeTruthy();
    expect(todoRes.ok()).toBeTruthy();

    const goal = await goalRes.json();
    const todo = await todoRes.json();

    await expect(page.getByText(goal.title, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(todo.title, { exact: false }).first()).toBeVisible();
  });

  test('대시보드에서 노트 작성 페이지로 이동할 수 있다', async ({ page }) => {
    const noteCreateLink = page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first();
    await noteCreateLink.click();

    await expect(page).toHaveURL(`/goal/${goalId}/note/create?todoId=${todoId}`);
  });

  test('할일 체크박스 클릭 시 done 상태가 토글된다', async ({ page, request }) => {
    const noteCreateLink = page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first();
    const todoItem = noteCreateLink.locator('xpath=ancestor::li[1]');
    const checkbox = todoItem.getByRole('checkbox');

    const beforeChecked = await checkbox.getAttribute('aria-checked');
    await checkbox.click();

    // 상태 변경이 반영될 때까지 폴링
    await expect
      .poll(async () => {
        const todoRes = await request.get(`/api/proxy/todos/${todoId}`);
        if (!todoRes.ok()) return null;
        const todo = await todoRes.json();
        return todo.done;
      })
      .toBe(beforeChecked !== 'true');
  });

  test('할일 즐겨찾기 버튼 클릭 시 favorite 상태가 토글된다', async ({ page, request }) => {
    const noteCreateLink = page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first();
    const todoItem = noteCreateLink.locator('xpath=ancestor::li[1]');
    const favoriteButton = todoItem.locator('button[aria-pressed]').first();

    const beforeRes = await request.get(`/api/proxy/todos/${todoId}`);
    expect(beforeRes.ok()).toBeTruthy();
    const beforeTodo = await beforeRes.json();

    await expect(favoriteButton).toHaveAttribute('aria-pressed', beforeTodo.favorite ? 'true' : 'false');
    await favoriteButton.click();

    // 상태 변경이 반영될 때까지 폴링
    await expect
      .poll(async () => {
        const todoRes = await request.get(`/api/proxy/todos/${todoId}`);
        if (!todoRes.ok()) return null;
        const todo = await todoRes.json();
        return todo.favorite;
      })
      .toBe(!beforeTodo.favorite);
  });

  test('할일 제목 클릭 시 상세 모달이 열린다', async ({ page, request }) => {
    const todoRes = await request.get(`/api/proxy/todos/${todoId}`);
    expect(todoRes.ok()).toBeTruthy();
    const todo = await todoRes.json();

    const noteCreateLink = page.locator(`a[href="/goal/${goalId}/note/create?todoId=${todoId}"]`).first();
    const todoItem = noteCreateLink.locator('xpath=ancestor::li[1]');
    const titleButton = todoItem.getByRole('button', { name: todo.title }).first();

    await titleButton.click();
    await expect(page.locator('div.fixed.inset-0.z-50.bg-black\\/50')).toBeVisible();
    await expect(page.locator('span.text-xl.font-semibold').filter({ hasText: todo.title })).toBeVisible();
  });
});
