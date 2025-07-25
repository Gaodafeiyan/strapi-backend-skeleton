export default {
  type: 'content-api',
  routes: [
  {
    method: 'GET',
    path: '/api/dinggou-jihuas/active',
    handler: 'dinggou-jihua.getActivePlans',
    config: { auth: false },
  },
    {
      method: 'GET',
      path: '/dinggou-jihuas',
      handler: 'dinggou-jihua.find',
    },
    {
      method: 'GET',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.findOne',
    },
    {
      method: 'POST',
      path: '/dinggou-jihuas',
      handler: 'dinggou-jihua.create',
    },
    {
      method: 'PUT',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.update',
    },
    {
      method: 'DELETE',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.delete',
    },
  ],
}; 