export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/api/webhooks',
      handler: 'webhook.find',
    },
    {
      method: 'GET',
      path: '/api/webhooks/:id',
      handler: 'webhook.findOne',
    },
    {
      method: 'POST',
      path: '/api/webhooks',
      handler: 'webhook.create',
    },
    {
      method: 'PUT',
      path: '/api/webhooks/:id',
      handler: 'webhook.update',
    },
    {
      method: 'DELETE',
      path: '/api/webhooks/:id',
      handler: 'webhook.delete',
    },
  ],
};