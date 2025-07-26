export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
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
    // 自定义路由
    {
      method: 'GET',
      path: '/qianbao-yues/test',
      handler: 'qianbao-yue.testConnection',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/qianbao-yues/user-wallet',
      handler: 'qianbao-yue.getUserWallet',
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
      path: '/qianbao-yues/token-reward-records',
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