export default () => ({
  rest: {
    enabled: true,      // ← 必须 true；或把 rest 整段删掉让 Strapi 默认开启
    prefix: '/api',
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
});
