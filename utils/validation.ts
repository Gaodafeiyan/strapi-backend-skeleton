export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  return typeof username === 'string' && username.length >= 3 && username.length <= 20;
};

export const validatePassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

export const validateInviteCode = (code: string): boolean => {
  return typeof code === 'string' && code.length >= 8 && code.length <= 10 && /^[A-Z0-9]+$/.test(code);
};

export const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && !isNaN(amount);
};

export const validateId = (id: any): boolean => {
  const numId = Number(id);
  return typeof numId === 'number' && numId > 0 && !isNaN(numId);
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}; 