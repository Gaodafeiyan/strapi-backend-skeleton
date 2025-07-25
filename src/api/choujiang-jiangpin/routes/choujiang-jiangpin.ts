export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/choujiang-jiangpins',
      handler: 'choujiang-jiangpin.find',
    },
    {
      method: 'GET',
      path: '/choujiang-jiangpins/:id',
      handler: 'choujiang-jiangpin.findOne',
    },
    {
      method: 'POST',
      path: '/choujiang-jiangpins',
      handler: 'choujiang-jiangpin.create',
    },
    {
      method: 'PUT',
      path: '/choujiang-jiangpins/:id',
      handler: 'choujiang-jiangpin.update',
    },
    {
      method: 'DELETE',
      path: '/choujiang-jiangpins/:id',
      handler: 'choujiang-jiangpin.delete',
    },
  ],
}; 