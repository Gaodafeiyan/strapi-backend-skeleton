export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.find',
    },
    {
      method: 'GET',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.findOne',
    },
    {
      method: 'POST',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.create',
    },
    {
      method: 'PUT',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.update',
    },
    {
      method: 'DELETE',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.delete',
    },
    {
      method: 'GET',
      path: '/qianbao-yues/token-balances',
      handler: 'qianbao-yue.getTokenBalances',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/qianbao-yues/token-rewards',
      handler: 'qianbao-yue.getTokenRewardRecords',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 