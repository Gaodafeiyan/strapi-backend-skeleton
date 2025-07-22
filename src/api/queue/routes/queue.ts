export default {
  routes: [
    {
      method: 'GET',
      path: '/queues/status',
      handler: 'queue.getStatus',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/queues/clean',
      handler: 'queue.clean',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/queues/pause',
      handler: 'queue.pause',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/queues/resume',
      handler: 'queue.resume',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/queues/details',
      handler: 'queue.getDetails',
      config: {
        auth: false,
      },
    },
  ],
}; 