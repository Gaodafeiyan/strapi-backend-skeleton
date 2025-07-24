export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/dinggou-dingdans',
      handler: 'dinggou-dingdan.find',
    },
    {
      method: 'GET',
      path: '/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.findOne',
    },
    {
      method: 'POST',
      path: '/dinggou-dingdans',
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
      path: '/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.update',
    },
    {
      method: 'DELETE',
      path: '/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.delete',
    },
    {
      method: 'POST',
      path: '/dinggou-dingdans/:id/redeem',
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