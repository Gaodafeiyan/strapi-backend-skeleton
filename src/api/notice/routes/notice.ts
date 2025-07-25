export default {
  type: 'content-api',
  routes: [
  {
    method: 'GET',
    path: '/api/notices/active',
    handler: 'notice.getActiveNotices',
    config: { auth: false },
  },
    {
      method: 'GET',
      path: '/notices',
      handler: 'notice.find',
    },
    {
      method: 'GET',
      path: '/notices/:id',
      handler: 'notice.findOne',
    },
    {
      method: 'POST',
      path: '/notices',
      handler: 'notice.create',
    },
    {
      method: 'PUT',
      path: '/notices/:id',
      handler: 'notice.update',
    },
    {
      method: 'DELETE',
      path: '/notices/:id',
      handler: 'notice.delete',
    },
  ],
}; 