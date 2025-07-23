export default {
  routes: [
    {
      method: 'POST',
      path: '/internal-messages/send',
      handler: 'internal-message.sendMessage',
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
      path: '/internal-messages/send-batch',
      handler: 'internal-message.sendBatchMessage',
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
      path: '/internal-messages/user',
      handler: 'internal-message.getUserMessages',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/internal-messages/:id/read',
      handler: 'internal-message.markAsRead',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/internal-messages/batch-read',
      handler: 'internal-message.markBatchAsRead',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/internal-messages/:id',
      handler: 'internal-message.deleteMessage',
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
      path: '/internal-messages/stats',
      handler: 'internal-message.getMessageStats',
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