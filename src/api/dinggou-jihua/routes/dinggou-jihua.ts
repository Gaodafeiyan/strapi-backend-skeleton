export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/dinggou-jihuas',
      handler: 'dinggou-jihua.find',
    },
    {
      method: 'GET',
      path: '/api/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.findOne',
    },
    {
      method: 'POST',
      path: '/api/dinggou-jihuas',
      handler: 'dinggou-jihua.create',
    },
    {
      method: 'PUT',
      path: '/api/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.update',
    },
    {
      method: 'DELETE',
      path: '/api/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.delete',
    },
  ],
}; 