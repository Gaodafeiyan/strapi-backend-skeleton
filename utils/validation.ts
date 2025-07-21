export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  return username && username.length >= 3 && username.length <= 20;
};

export const validatePassword = (password: string): boolean => {
  return password && password.length >= 6;
};

export const validateInviteCode = (code: string): boolean => {
  return code && code.length === 9 && /^[A-Z0-9]{9}$/.test(code);
};

export const validateAmount = (amount: number): boolean => {
  return amount && amount > 0 && !isNaN(amount);
};

export const validateId = (id: any): boolean => {
  const numId = Number(id);
  return numId && numId > 0 && !isNaN(numId);
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}; 