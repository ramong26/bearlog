'use client';

import { ChevronLeftIcon, ChevronUpIcon } from 'lucide-react';
import clsx from 'clsx';

interface LinkEmbedPreviewProps {
  url: string;
  onClose: () => void;
}

export default function LinkEmbedPreview({ url, onClose }: LinkEmbedPreviewProps) {
  const proxyUrl = `/api/link-proxy?url=${encodeURIComponent(url)}`;

  return (
    <>
      {/* ── lg 이상 — 오른쪽 고정 패널 ── */}
      <div
        className={clsx(
          'z-10 hidden lg:flex',
          'fixed top-0 right-0 h-full w-[734px] flex-col items-start justify-center',
          'border-l border-[#DDD] bg-[#FAFAFA]',
          'px-10',
        )}
      >
        <div className="relative h-[376px] w-full overflow-hidden border border-[#CCC]">
          <iframe src={proxyUrl} className="h-full w-full border-0" title="링크 미리보기" sandbox="allow-scripts" />
        </div>
      </div>

      {/* lg 패널 닫기 버튼 — 패널 왼쪽에 고정 */}
      <button
        type="button"
        onClick={onClose}
        className={clsx(
          'hidden lg:flex',
          'fixed top-1/6 right-[734px] z-10 -translate-y-1/2',
          'items-center justify-center md:h-[60px] md:w-[38px]',
          'rounded-tl-2xl rounded-bl-2xl',
          'border border-[#DDD] bg-[#FAFAFA]',
        )}
      >
        <ChevronLeftIcon size={24} className="stroke-[#535353]" />
      </button>

      {/* ── md 이하 — 하단 패널 ── */}
      <div className={clsx('lg:hidden', 'fixed right-0 bottom-0 left-0 z-10', 'border-t border-[#DDD] bg-[#FAFAFA]')}>
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className={clsx(
            'absolute -top-[28px] left-5/6 -translate-x-1/2',
            'flex items-center justify-center',
            'h-[28px] w-[44px] rounded-tl-[12px] rounded-tr-[12px]',
            'border border-[#DDD] bg-[#FAFAFA]',
          )}
        >
          <ChevronUpIcon size={20} className="stroke-[#535353]" />
        </button>

        <div className="h-[280px] w-full overflow-hidden md:h-[337px]">
          <iframe src={proxyUrl} className="h-full w-full border-0" title="링크 미리보기" sandbox="allow-scripts" />
        </div>
      </div>
    </>
  );
}
