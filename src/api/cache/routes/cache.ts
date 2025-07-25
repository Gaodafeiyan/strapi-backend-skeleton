export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/caches',
      handler: 'cache.find',
    },
    {
      method: 'GET',
      path: '/caches/:id',
      handler: 'cache.findOne',
    },
    {
      method: 'POST',
      path: '/caches',
      handler: 'cache.create',
    },
    {
      method: 'PUT',
      path: '/caches/:id',
      handler: 'cache.update',
    },
    {
      method: 'DELETE',
      path: '/caches/:id',
      handler: 'cache.delete',
    },
  ],
}; 