import { randomBytes } from 'crypto';

export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  return [...randomBytes(8)].map(b => chars[b % chars.length]).join('');
}; 