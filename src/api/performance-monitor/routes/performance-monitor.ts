export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/performance-monitors',
      handler: 'performance-monitor.find',
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
      path: '/performance-monitors/:id',
      handler: 'performance-monitor.findOne',
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
      path: '/performance-monitors',
      handler: 'performance-monitor.create',
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
      path: '/performance-monitors/:id',
      handler: 'performance-monitor.update',
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
      path: '/performance-monitors/:id',
      handler: 'performance-monitor.delete',
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
      path: '/performance-monitor/system-metrics',
      handler: 'performance-monitor.getSystemMetrics',
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
      path: '/performance-monitor/error-rate',
      handler: 'performance-monitor.getErrorRate',
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
      path: '/performance-monitor/business-metrics',
      handler: 'performance-monitor.getBusinessMetrics',
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
      path: '/performance-monitor/alert-config',
      handler: 'performance-monitor.getAlertConfig',
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
      path: '/performance-monitor/alert-config',
      handler: 'performance-monitor.updateAlertConfig',
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