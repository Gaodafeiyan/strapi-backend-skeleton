export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/webhooks',
      handler: 'webhook.find',
    },
    {
      method: 'POST',
      path: '/api/webhooks',
      handler: 'webhook.create',
    },
  ],
};