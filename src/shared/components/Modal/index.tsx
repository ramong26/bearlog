'use client';
import { useModalStore } from '@/shared/stores/useModalStore';
import clsx from 'clsx';
import { useRef, useEffect, MouseEvent } from 'react';
import { createPortal } from 'react-dom';

export const Modal = () => {
  const { content, isOpen, closeModal, variant } = useModalStore();

  // 모달의 backdrop을 가리키는 ref
  const modalRef = useRef<HTMLDivElement>(null);

  // 모달이 열리면 스크롤 비활성화 + esc 눌렀을 때 모달 나가기
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  // 모달 backdrop을 클릭한 경우 모달을 닫음
  const handleClickOutside = (e: MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  // 모달이 열려있지 않거나 서버에서 실행되는 경우를 차단
  if (!isOpen || typeof window === 'undefined') return null;

  // Portal을 생성하고 내부에서 모달 content를 렌더링
  return createPortal(
    <div
      onClick={handleClickOutside}
      className={clsx(
        'fixed inset-0 z-50 bg-black/50',
        variant === 'bottom' && 'flex items-end md:flex md:items-center md:justify-center',
        variant === 'center' && 'flex items-center justify-center',
      )}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={clsx(variant === 'bottom' && 'w-full md:w-auto')}
      >
        {content}
      </div>
    </div>,
    document.body,
  );
};
