'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ImageUpIcon, LoaderIcon, XIcon } from 'lucide-react';

import { fetchImages } from '@/shared/lib/api';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface ImageInput {
  image: string | null;
  onChange: (image: string | null) => void;
}

export default function ImageInput({ image, onChange }: ImageInput) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useLanguage();

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsUploading(true);
    try {
      const { uploadUrl, url } = await fetchImages.postImageUploadUrl({ fileName: file.name });
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      if (!response.ok) throw new Error('이미지 업로드 실패');
      onChange(url);
    } catch (error) {
      console.error('이미지 업로드 중 오류 발생:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {image ? (
        <div className="relative h-[101px] w-[160px] overflow-hidden rounded-2xl">
          <Image src={image} alt="이미지 미리보기" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute top-[10px] right-[10px] flex size-[18px] cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white"
          >
            <XIcon size={10} className="stroke-gray-400" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-[101px] w-full cursor-pointer flex-col items-center justify-center gap-[2px] rounded-2xl border border-gray-300 bg-gray-50 disabled:cursor-not-allowed dark:border-[#7E7E7E] dark:bg-gray-850"
        >
          {isUploading ? (
            <LoaderIcon size={24} className="animate-spin stroke-gray-400" />
          ) : (
            <>
              <ImageUpIcon size={24} className="stroke-gray-400" />
              <p className="text-base font-medium text-gray-400">{t.todo.imageAttach}</p>
            </>
          )}
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSelectImage} />
      <p className="px-1 text-xs font-medium text-gray-400 md:text-sm dark:text-white">{t.todo.imageLimit}</p>
    </>
  );
}
