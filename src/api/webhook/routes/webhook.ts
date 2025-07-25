export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/webhooks',
      handler: 'webhook.find',
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
      path: '/webhooks/:id',
      handler: 'webhook.findOne',
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
      path: '/webhooks',
      handler: 'webhook.create',
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
      path: '/webhooks/:id',
      handler: 'webhook.update',
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
      path: '/webhooks/:id',
      handler: 'webhook.delete',
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
      path: '/webhook/transaction',
      handler: 'webhook.handleTransaction',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 