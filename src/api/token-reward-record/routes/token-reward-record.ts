export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/token-reward-records',
      handler: 'token-reward-record.find',
    },
    {
      method: 'GET',
      path: '/token-reward-records/:id',
      handler: 'token-reward-record.findOne',
    },
    {
      method: 'POST',
      path: '/token-reward-records',
      handler: 'token-reward-record.create',
    },
    {
      method: 'PUT',
      path: '/token-reward-records/:id',
      handler: 'token-reward-record.update',
    },
    {
      method: 'DELETE',
      path: '/token-reward-records/:id',
      handler: 'token-reward-record.delete',
    },
  ],
}; 