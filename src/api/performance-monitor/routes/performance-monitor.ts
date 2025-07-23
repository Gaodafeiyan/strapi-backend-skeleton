export default {
  routes: [
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