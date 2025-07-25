export default {
  routes: [
    {
      method: 'GET',
      path: '/api/ai-tokens',
      handler: 'ai-token.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/api/ai-tokens/active',
      handler: 'ai-token.getActiveTokens',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/api/ai-tokens/:id/price',
      handler: 'ai-token.getTokenPrice',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/api/ai-tokens/prices/batch',
      handler: 'ai-token.getBatchPrices',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/api/ai-tokens/initialize',
      handler: 'ai-token.initializeTokens',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 