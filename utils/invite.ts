import { customAlphabet } from 'nanoid';

export const generateInviteCode = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZ123456789',
  8
); 