'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import LinkEmbedPreview from './LinkEmbedPreview';

interface LinkEmbedProps {
  url: string;
  onRemove: () => void;
  readOnly?: boolean;
}

// URL에서 사이트 이름 추출
function getSiteName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.split('.')[0]; // "codeit.kr" → "codeit"
  } catch {
    return url;
  }
}

// favicon URL 생성
function getFaviconUrl(url: string): string {
  try {
    const { origin } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=24`;
  } catch {
    return '';
  }
}

export default function LinkEmbed({ url, onRemove, readOnly = false }: LinkEmbedProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      {showPreview && <LinkEmbedPreview url={url} onClose={() => setShowPreview(false)} />}
      <button
        type="button"
        className="flex w-full cursor-pointer flex-col gap-1 rounded-[14px] bg-[#FAFAFA] px-4 py-[14px] text-left"
        onClick={() => setShowPreview((prev) => !prev)}
      >
        {/* 상단 — 파비콘 + 사이트명 + 삭제 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* 파비콘 */}
            <div className="flex size-6 items-center justify-center overflow-hidden">
              <Image
                src={getFaviconUrl(url)}
                alt="favicon"
                width={16}
                height={16}
                className="size-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            {/* 사이트 제목 */}
            <p className="text-sm font-medium tracking-[-0.42px] text-[#333]">{getSiteName(url)}</p>
          </div>
          {/* 삭제 버튼 */}
          {!readOnly && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onRemove(); } }}
              className="cursor-pointer text-[#A4A4A4] transition-colors hover:text-[#333]"
            >
              <XIcon size={20} />
            </div>
          )}
        </div>

        {/* 하단 — URL */}
        <p className="ml-[5px] truncate text-xs font-normal text-[#A4A4A4]">{url}</p>
      </button>
    </>
  );
}
