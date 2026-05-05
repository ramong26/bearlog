'use client';

import { useState } from 'react';
import { useModalStore } from '@/shared/stores/useModalStore';
import { OctagonAlert } from 'lucide-react';
import Button from '../../Button';
import Input from '../../Input';
import { useLanguage } from '@/shared/contexts/LanguageContext';

/**
 * PopupModal
 *
 * 확인/취소가 필요한 팝업 모달 컴포넌트
 *
 * @example 기본 사용법
 * ```tsx
 *
 * // 1. 목표 삭제
 * openModal(
 *   <PopupModal
 *     variant={{ type: 'goalDelete' }}
 *     onConfirm={() => handleDeleteGoal()}
 *   />
 * );
 *
 * // 2. 노트 삭제
 * openModal(
 *   <PopupModal
 *     variant={{ type: 'noteDelete' }}
 *     onConfirm={() => handleDeleteNote()}
 *   />
 * );
 *
 * // 3. 노트 불러오기 - noteTitle 필수
 * openModal(
 *   <PopupModal
 *     variant={{ type: 'noteLoad', noteTitle: '나의 첫 번째 노트' }}
 *     onConfirm={() => handleLoadNote()}
 *   />
 * );
 *
 * // 4. 게시물 작성 취소
 * openModal(
 *   <PopupModal
 *     variant={{ type: 'postCancel' }}
 *     onConfirm={() => handleCancel()}
 *   />
 * );
 * ```
 *
 * @param variant - 모달 유형
 * | type          | 추가 props            | 설명             |
 * |---------------|-----------------------|------------------|
 * | goalDelete    | 없음                  | 목표 삭제 확인   |
 * | noteDelete    | 없음                  | 노트 삭제 확인   |
 * | noteLoad      | noteTitle: string     | 노트 불러오기    |
 * | postCancel    | 없음                  | 게시물 작성 취소 |
 * | githubDisconnect | 없음               | GitHub 연동 해제 |
 * | accountDelete | isLocalUser: boolean  | 회원 탈퇴        |
 *
 * @param onConfirm - 확인 버튼 클릭 시 실행할 콜백 (closeModal은 자동 호출됨)
 */

type PopupModalVariant =
  | { type: 'goalDelete' }
  | { type: 'noteDelete' }
  | { type: 'noteLoad'; noteTitle: string }
  | { type: 'postCancel' }
  | { type: 'githubDisconnect' }
  | { type: 'accountDelete'; isLocalUser: boolean };

interface PopupModalProps {
  onConfirm: (password?: string) => void;
  variant: PopupModalVariant;
}

interface ModalConfig {
  titleLines: string[];
  warning: string | null;
  confirmLabel: string;
  labelledBy: string;
  showPasswordInput?: boolean;
}

export function PopupModal({ onConfirm, variant }: PopupModalProps) {
  const { closeModal } = useModalStore();
  const { t } = useLanguage();

  function getConfig(v: PopupModalVariant): ModalConfig {
    switch (v.type) {
      case 'goalDelete':
        return {
          titleLines: [t.modal.deleteGoalTitle],
          warning: t.modal.deleteGoalDesc,
          confirmLabel: t.modal.confirm,
          labelledBy: 'confirm-modal-goal-delete',
        };
      case 'noteDelete':
        return {
          titleLines: [t.modal.deleteNoteTitle],
          warning: t.modal.deleteNoteDesc,
          confirmLabel: t.modal.confirm,
          labelledBy: 'confirm-modal-note-delete',
        };
      case 'noteLoad':
        return {
          titleLines: [`'${v.noteTitle}'`, t.modal.loadNoteTitle],
          warning: null,
          confirmLabel: t.modal.loadNoteButton,
          labelledBy: 'confirm-modal-note-load',
        };
      case 'postCancel':
        return {
          titleLines: [t.modal.cancelPostTitle],
          warning: t.modal.cancelPostDesc,
          confirmLabel: t.modal.confirm,
          labelledBy: 'confirm-modal-post-cancel',
        };
      case 'githubDisconnect':
        return {
          titleLines: [t.modal.githubDisconnectTitle],
          warning: t.modal.githubDisconnectDesc,
          confirmLabel: t.modal.githubDisconnectButton,
          labelledBy: 'confirm-modal-github-disconnect',
        };
      case 'accountDelete':
        return {
          titleLines: [t.modal.withdrawTitle],
          warning: t.modal.withdrawDesc,
          confirmLabel: t.modal.withdrawButton,
          labelledBy: 'confirm-modal-account-delete',
          showPasswordInput: v.isLocalUser,
        };
    }
  }

  const { titleLines, warning, confirmLabel, labelledBy } = getConfig(variant);
  const [password, setPassword] = useState('');

  const isLocalAccountDelete = variant.type === 'accountDelete' && variant.isLocalUser;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="w-114 min-h-68.25 rounded-3xl bg-white dark:bg-gray-850 p-4 pt-12 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)] md:rounded-[40px] md:p-8 md:pt-16"
    >
      {/* 타이틀 + 경고 */}
      <div className="mb-8 flex flex-col text-center md:mb-10">
        <p id={labelledBy} className="text-sm font-semibold text-slate-800 dark:text-gray-100 md:text-xl">
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
        {warning && (
          <div className="mt-[17.5px] flex items-start justify-center gap-1">
            <OctagonAlert className="mt-1 text-bearlog-500" size={15} />
            <span className="text-bearlog-500 text-xs leading-6 font-medium whitespace-pre-line md:text-base">
              {warning}
            </span>
          </div>
        )}
        {isLocalAccountDelete && (
          <Input
            type="password"
            placeholder={t.modal.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-4"
          />
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="cancel"
          className="flex-1 px-[18px] py-[10px] text-sm text-gray-500 dark:bg-transparent dark:text-gray-500 dark:border-[#AFAFAF] md:py-3.5 md:text-[18px]"
          onClick={closeModal}
        >
          {t.modal.cancel}
        </Button>
        <Button
          variant="primary"
          className="flex-1 px-[18px] py-[10px] text-sm dark:text-gray-850 md:py-3.5 md:text-[18px]"
          disabled={isLocalAccountDelete && !password}
          onClick={() => {
            onConfirm(isLocalAccountDelete ? password : undefined);
            closeModal();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
