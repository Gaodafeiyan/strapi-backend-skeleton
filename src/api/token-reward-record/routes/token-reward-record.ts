export default {
  type: 'content-api',
  routes: [
    // 自定义路由
    {
      method: 'GET',
      path: '/token-reward-records/my-rewards',
      handler: 'token-reward-record.getMyRewards',
      config: { auth: { scope: ['authenticated'] } },
    },
    {
      method: 'POST',
      path: '/token-reward-records/give',
      handler: 'token-reward-record.giveTokenReward',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    {
      method: 'POST',
      path: '/token-reward-records/give-by-usdt-value',
      handler: 'token-reward-record.giveTokenRewardByUSDTValue',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    {
      method: 'POST',
      path: '/token-reward-records/batch-give',
      handler: 'token-reward-record.batchGiveTokenReward',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    {
      method: 'POST',
      path: '/token-reward-records/batch-give-by-usdt-value',
      handler: 'token-reward-record.batchGiveTokenRewardByUSDTValue',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    {
      method: 'GET',
      path: '/token-reward-records/stats',
      handler: 'token-reward-record.getRewardStats',
      config: { auth: { scope: ['authenticated'] } },
    },
    // 标准CRUD路由
    {
      method: 'GET',
      path: '/token-reward-records',
      handler: 'token-reward-record.find',
    },
    {
      method: 'GET',
      path: '/token-reward-records/:id',
      handler: 'token-reward-record.findOne',
    },
    {
      method: 'POST',
      path: '/token-reward-records',
      handler: 'token-reward-record.create',
    },
    {
      method: 'PUT',
      path: '/token-reward-records/:id',
      handler: 'token-reward-record.update',
    },
    {
      method: 'DELETE',
      path: '/token-reward-records/:id',
      handler: 'token-reward-record.delete',
    },
  ],
}; 