export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/api/qianbao-yues',
      handler: 'qianbao-yue.find',
    },
    {
      method: 'GET',
      path: '/api/qianbao-yues/:id',
      handler: 'qianbao-yue.findOne',
    },
    {
      method: 'POST',
      path: '/api/qianbao-yues',
      handler: 'qianbao-yue.create',
    },
    {
      method: 'PUT',
      path: '/api/qianbao-yues/:id',
      handler: 'qianbao-yue.update',
    },
    {
      method: 'DELETE',
      path: '/api/qianbao-yues/:id',
      handler: 'qianbao-yue.delete',
    },
    // 自定义路由
    {
      method: 'GET',
      path: '/api/qianbao-yues/user-wallet',
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
      path: '/api/qianbao-yues/token-balances',
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
      path: '/api/qianbao-yues/token-reward-records',
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