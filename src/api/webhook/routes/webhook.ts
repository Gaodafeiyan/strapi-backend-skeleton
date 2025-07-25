export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/webhooks',
      handler: 'webhook.find',
    },
    {
      method: 'GET',
      path: '/webhooks/:id',
      handler: 'webhook.findOne',
    },
    {
      method: 'POST',
      path: '/webhooks',
      handler: 'webhook.create',
    },
    {
      method: 'PUT',
      path: '/webhooks/:id',
      handler: 'webhook.update',
    },
    {
      method: 'DELETE',
      path: '/webhooks/:id',
      handler: 'webhook.delete',
    },
  ],
};