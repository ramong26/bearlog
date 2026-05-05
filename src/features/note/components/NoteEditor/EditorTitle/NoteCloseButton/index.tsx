'use client';

import { XIcon } from 'lucide-react';

export default function NoteCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} className="absolute top-5 right-5 cursor-pointer md:top-10 md:right-10">
      <XIcon size={24} className="stroke-[#A4A4A4]" />
    </button>
  );
}
