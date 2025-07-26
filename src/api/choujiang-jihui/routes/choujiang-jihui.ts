export default {
  type: 'content-api',
  routes: [
    // 自定义路由
    {
      method: 'GET',
      path: '/choujiang-jihuis/my-chances',
      handler: 'choujiang-jihui.getMyChances',
      config: { auth: { scope: ['authenticated'] } },
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis/give',
      handler: 'choujiang-jihui.giveChance',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis/batch-give',
      handler: 'choujiang-jihui.batchGiveChance',
      config: { auth: { scope: ['admin::is-authenticated'] } },
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis/:chanceId/use',
      handler: 'choujiang-jihui.useChance',
      config: { auth: { scope: ['authenticated'] } },
    },
    {
      method: 'GET',
      path: '/choujiang-jihuis/stats',
      handler: 'choujiang-jihui.getChanceStats',
      config: { auth: { scope: ['authenticated'] } },
    },
    // 标准CRUD路由
    {
      method: 'GET',
      path: '/choujiang-jihuis',
      handler: 'choujiang-jihui.find',
    },
    {
      method: 'GET',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.findOne',
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis',
      handler: 'choujiang-jihui.create',
    },
    {
      method: 'PUT',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.update',
    },
    {
      method: 'DELETE',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.delete',
    },
  ],
}; 