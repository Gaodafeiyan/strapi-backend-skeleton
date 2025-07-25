export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/queues',
      handler: 'queue.find',
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
      path: '/queues/:id',
      handler: 'queue.findOne',
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
      path: '/queues',
      handler: 'queue.create',
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
      path: '/queues/:id',
      handler: 'queue.update',
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
      path: '/queues/:id',
      handler: 'queue.delete',
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
      path: '/queues/status',
      handler: 'queue.getStatus',
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
      path: '/queues/clean',
      handler: 'queue.clean',
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
      path: '/queues/pause',
      handler: 'queue.pause',
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
      path: '/queues/resume',
      handler: 'queue.resume',
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
      path: '/queues/details',
      handler: 'queue.getDetails',
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