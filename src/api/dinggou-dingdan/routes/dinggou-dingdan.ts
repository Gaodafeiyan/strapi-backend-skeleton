export default {
  type: 'content-api',
  routes: [
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
      method: 'PUT',
      path: '/api/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.update',
    },
    {
      method: 'DELETE',
      path: '/api/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.delete',
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