export default {
  routes: [
    {
      method: 'GET',
      path: '/users',
      handler: 'user.find',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/users/:id',
      handler: 'user.findOne',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 