export default {
  routes: [
    {
      method: 'GET',
      path: '/health',
      handler: 'health.check',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/health/detailed',
      handler: 'health.detailed',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 