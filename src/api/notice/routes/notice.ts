export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/notices',
      handler: 'notice.find',
    },
    {
      method: 'GET',
      path: '/api/notices/:id',
      handler: 'notice.findOne',
    },
    {
      method: 'POST',
      path: '/api/notices',
      handler: 'notice.create',
    },
    {
      method: 'PUT',
      path: '/api/notices/:id',
      handler: 'notice.update',
    },
    {
      method: 'DELETE',
      path: '/api/notices/:id',
      handler: 'notice.delete',
    },
  ],
}; 