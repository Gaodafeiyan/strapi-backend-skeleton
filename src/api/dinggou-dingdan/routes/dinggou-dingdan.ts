export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/api/dinggou-dingdans',
      handler: 'dinggou-dingdan.find',
    },
    {
      method: 'GET',
      path: '/api/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.findOne',
    },
    {
      method: 'POST',
      path: '/api/dinggou-dingdans',
      handler: 'dinggou-dingdan.create',
    },
    {
      method: 'PUT',
      path: '/api/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.update',
    },
    {
      method: 'DELETE',
      path: '/api/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.delete',
    },
    // 自定义路由
    {
      method: 'POST',
      path: '/api/dinggou-dingdans/create-with-plan',
      handler: 'dinggou-dingdan.createWithPlan',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/api/dinggou-dingdans/:id/redeem',
      handler: 'dinggou-dingdan.redeem',
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