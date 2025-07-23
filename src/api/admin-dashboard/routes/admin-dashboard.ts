export default {
  routes: [
    {
      method: 'GET',
      path: '/admin-dashboard/overview',
      handler: 'admin-dashboard.getSystemOverview',
      config: {
        auth: {
          scope: ['admin']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/admin-dashboard/users',
      handler: 'admin-dashboard.getUserManagement',
      config: {
        auth: {
          scope: ['admin']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/admin-dashboard/orders',
      handler: 'admin-dashboard.getOrderManagement',
      config: {
        auth: {
          scope: ['admin']
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 