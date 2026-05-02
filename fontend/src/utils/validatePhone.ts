const VN_MOBILE_PATTERN = /^0(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/;

export const normalizeVietnamPhone = (input: string): string => {
  const compact = String(input || '').replace(/\s+/g, '').replace(/[.-]/g, '');
  if (compact.startsWith('+84')) {
    return `0${compact.slice(3)}`;
  }
  if (compact.startsWith('84')) {
    return `0${compact.slice(2)}`;
  }
  return compact;
};

export const validatePhone = (input: string): boolean => {
  const normalized = normalizeVietnamPhone(input);
  return VN_MOBILE_PATTERN.test(normalized);
};
