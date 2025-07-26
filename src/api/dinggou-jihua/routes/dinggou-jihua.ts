export default {
  type: 'content-api',
  routes: [
    // 自定义路由
    {
      method: 'POST',
      path: '/dinggou-jihuas/:planId/invest',
      handler: 'dinggou-jihua.invest',
      config: { auth: { scope: ['authenticated'] } },
    },
    {
      method: 'POST',
      path: '/dinggou-jihuas/:orderId/redeem',
      handler: 'dinggou-jihua.redeem',
      config: { auth: { scope: ['authenticated'] } },
    },
    {
      method: 'GET',
      path: '/dinggou-jihuas/:planId/stats',
      handler: 'dinggou-jihua.getPlanStats',
      config: { auth: { scope: ['authenticated'] } },
    },
    {
      method: 'GET',
      path: '/dinggou-jihuas/my-investments',
      handler: 'dinggou-jihua.getMyInvestments',
      config: { auth: { scope: ['authenticated'] } },
    },
    // 新增：赠送AI代币给计划参与者
    {
      method: 'POST',
      path: '/dinggou-jihuas/:planId/give-token',
      handler: 'dinggou-jihua.giveTokenToPlanParticipants',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    // 新增：赠送抽奖次数给计划参与者
    {
      method: 'POST',
      path: '/dinggou-jihuas/:planId/give-lottery-chances',
      handler: 'dinggou-jihua.giveLotteryChancesToPlanParticipants',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    // 新增：获取计划参与者列表
    {
      method: 'GET',
      path: '/dinggou-jihuas/:planId/participants',
      handler: 'dinggou-jihua.getPlanParticipants',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    // 标准CRUD路由
    {
      method: 'GET',
      path: '/dinggou-jihuas',
      handler: 'dinggou-jihua.find',
    },
    {
      method: 'GET',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.findOne',
    },
    {
      method: 'POST',
      path: '/dinggou-jihuas',
      handler: 'dinggou-jihua.create',
    },
    {
      method: 'PUT',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.update',
    },
    {
      method: 'DELETE',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.delete',
    },
  ],
}; 