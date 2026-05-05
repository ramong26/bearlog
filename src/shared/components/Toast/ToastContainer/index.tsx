'use client';

import Toast from '@/shared/components/Toast';
import { useToastStore } from '@/shared/stores/useToastStore';

export default function ToastContainer() {
  const { show, message, variant, hideToast } = useToastStore();

  return (
    <Toast show={show} onClose={hideToast} variant={variant}>
      {message}
    </Toast>
  );
}
