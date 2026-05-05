import { test, expect } from '@playwright/test';
import fs from 'fs';
import { TEST_DATA_FILE } from '../constants';

let goalId: string;
let todoId: string;
let NOTE_CREATE_URL: string;
let NOTE_LIST_URL: string;

test.beforeAll(() => {
  ({ goalId, todoId } = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf-8')));
  NOTE_CREATE_URL = `/goal/${goalId}/note/create?todoId=${todoId}`;
  NOTE_LIST_URL = `/goal/${goalId}/note`;
});

const TEST_TITLE = '[E2E] 테스트 노트';
const TEST_CONTENT = 'E2E 테스트 내용입니다.';
const EDITED_TITLE = '[E2E] 수정된 노트';

test.describe('노트 생성 E2E', () => {
  test('제목이 비어있으면 등록 버튼 비활성화', async ({ page }) => {
    await page.goto(NOTE_CREATE_URL);

    await expect(page.getByRole('button', { name: /등록/ })).toBeDisabled();
  });

  test('제목 30자 초과 입력 불가', async ({ page }) => {
    await page.goto(NOTE_CREATE_URL);

    const titleInput = page.getByPlaceholder('노트의 제목을 입력해주세요');
    await titleInput.fill('a'.repeat(35));

    await expect(titleInput).toHaveValue('a'.repeat(30));
  });

  test('노트 생성 → 상세 페이지 이동 → 목록 반영 확인 후 삭제', async ({ page }) => {
    // 1. 노트 생성
    await page.goto(NOTE_CREATE_URL);
    await page.getByPlaceholder('제목을 입력해주세요').fill(TEST_TITLE);
    await page.locator('.ProseMirror').click();
    await page.keyboard.type(TEST_CONTENT);
    await page.getByRole('button', { name: /등록/ }).click();

    // 2. 상세 페이지로 리다이렉트 확인 + noteId 추출
    await expect(page).toHaveURL(/\/goal\/\d+\/note\/\d+/);
    await expect(page.locator('input[readonly]')).toHaveValue(TEST_TITLE);
    const match = page.url().match(/\/note\/(\d+)/);
    expect(match).not.toBeNull();
    const noteId = match![1];

    // 3. 노트 목록에 반영됐는지 확인
    await page.goto(NOTE_LIST_URL);
    await expect(page.locator(`a[href*="/note/${noteId}"]`)).toBeVisible();

    // 4. 생성한 노트 삭제 (테스트 데이터 정리)
    const noteItem = page.locator(`a[href*="/note/${noteId}"]`);
    await noteItem.getByRole('button').click();
    await page.getByRole('button', { name: '삭제하기' }).click();
    await page.getByRole('button', { name: '확인' }).click();

    await expect(page.locator(`a[href*="/note/${noteId}"]`)).not.toBeVisible();
  });

  test('임시저장 → 재진입 시 불러오기 토스트 표시', async ({ page }) => {
    // 1. 제목 입력 후 임시저장
    await page.goto(NOTE_CREATE_URL);
    await page.getByPlaceholder('노트의 제목을 입력해주세요').fill(TEST_TITLE);
    await page.getByRole('button', { name: '임시저장' }).click();
    await expect(page.getByText(/임시저장/)).toBeVisible();

    // 2. 페이지 재진입 시 불러오기 토스트 표시 확인
    await page.goto(NOTE_CREATE_URL);
    await expect(page.getByText(/불러오기/)).toBeVisible();
  });
});

test.describe('노트 시나리오 E2E', () => {
  test('생성 → 수정 → 삭제', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox 드롭다운 클릭 타이밍 불안정');
    let noteId: string;

    await test.step('노트 생성', async () => {
      await page.goto(NOTE_CREATE_URL);
      await page.getByPlaceholder('노트의 제목을 입력해주세요').fill(TEST_TITLE);
      await page.locator('.ProseMirror').click();
      await page.keyboard.type(TEST_CONTENT);
      await expect(page.getByRole('button', { name: /등록/ })).toBeEnabled();
      await page.getByRole('button', { name: /등록/ }).click();

      await expect(page).toHaveURL(/\/goal\/\d+\/note\/\d+/);
      const match = page.url().match(/\/note\/(\d+)/);
      expect(match).not.toBeNull();
      noteId = match![1];
    });

    await test.step('노트 수정', async () => {
      await page.goto(`/goal/${goalId}/note/${noteId}/edit`);
      const titleInput = page.getByPlaceholder('노트의 제목을 입력해주세요');
      await titleInput.clear();
      await titleInput.fill(EDITED_TITLE);
      await page.getByRole('button', { name: '수정' }).click();

      await expect(page).toHaveURL(`/goal/${goalId}/note/${noteId}`);
      await expect(page.locator('input[readonly]')).toHaveValue(EDITED_TITLE);
    });

    await test.step('노트 삭제', async () => {
      await page.goto(NOTE_LIST_URL);
      const noteItem = page.locator(`a[href*="/note/${noteId}"]`);
      await noteItem.getByRole('button').click();
      await page.getByRole('button', { name: '삭제하기' }).click();
      await page.getByRole('button', { name: '확인' }).click();

      await expect(page.locator(`a[href*="/note/${noteId}"]`)).not.toBeVisible();
    });
  });
});
