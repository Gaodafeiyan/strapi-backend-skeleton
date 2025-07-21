export default ({ env }: { env: any }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'toBeModified'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'toBeModified'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'toBeModified'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', 'toBeModified'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
