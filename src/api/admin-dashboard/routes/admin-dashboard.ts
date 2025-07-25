export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/admin-dashboards',
      handler: 'admin-dashboard.find',
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
      path: '/admin-dashboards/:id',
      handler: 'admin-dashboard.findOne',
      config: {
        auth: {
          scope: ['admin']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/admin-dashboards',
      handler: 'admin-dashboard.create',
      config: {
        auth: {
          scope: ['admin']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/admin-dashboards/:id',
      handler: 'admin-dashboard.update',
      config: {
        auth: {
          scope: ['admin']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/admin-dashboards/:id',
      handler: 'admin-dashboard.delete',
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