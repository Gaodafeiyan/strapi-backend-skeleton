export default ({ env }: { env: any }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: [
      'strapi-backend-skeleton-key-1',
      'strapi-backend-skeleton-key-2',
      'strapi-backend-skeleton-key-3',
      'strapi-backend-skeleton-key-4'
    ],
  },
  cron: {
    enabled: true,
  },
});
