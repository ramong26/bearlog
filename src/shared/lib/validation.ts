interface ValidationMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordConfirmRequired: string;
  passwordMismatch: string;
}

const defaultMessages: ValidationMessages = {
  emailRequired: '이메일을 입력해주세요.',
  emailInvalid: '잘못된 이메일입니다.',
  passwordRequired: '비밀번호를 입력해주세요.',
  passwordMin: '비밀번호는 8자 이상이어야 합니다.',
  passwordConfirmRequired: '비밀번호 확인을 입력해주세요.',
  passwordMismatch: '비밀번호가 일치하지 않습니다.',
};

export const validateEmail = (value: string, messages: Partial<ValidationMessages> = {}): string => {
  const m = { ...defaultMessages, ...messages };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) return m.emailRequired;
  if (!emailRegex.test(value)) return m.emailInvalid;
  return '';
};

export const validatePassword = (password: string, messages: Partial<ValidationMessages> = {}): string => {
  const m = { ...defaultMessages, ...messages };
  if (!password) return m.passwordRequired;
  if (password.length < 8) return m.passwordMin;
  return '';
};

export const validatePasswordConfirm = (password: string, confirm: string, messages: Partial<ValidationMessages> = {}): string => {
  const m = { ...defaultMessages, ...messages };
  if (!confirm) return m.passwordConfirmRequired;
  if (password !== confirm) return m.passwordMismatch;
  return '';
};
