import { randomBytes } from 'crypto';

export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  let code = '';
  const bytes = randomBytes(8); // 8 字节 = 8 位邀请码
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}; 