export default ({ env }: { env: any }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'strapi-backend-skeleton-admin-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'strapi-backend-skeleton-api-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'strapi-backend-skeleton-transfer-salt'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', 'strapi-backend-skeleton-encryption-key-32-chars-long'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
