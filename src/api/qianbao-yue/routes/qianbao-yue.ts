export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.find',
    },
    {
      method: 'GET',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.findOne',
    },
    {
      method: 'POST',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.create',
    },
    {
      method: 'PUT',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.update',
    },
    {
      method: 'DELETE',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.delete',
    },
  ],
}; 