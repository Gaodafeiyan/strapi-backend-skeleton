export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/qianbao-tixians',
      handler: 'qianbao-tixian.find',
    },
    {
      method: 'GET',
      path: '/api/qianbao-tixians/:id',
      handler: 'qianbao-tixian.findOne',
    },
    {
      method: 'POST',
      path: '/api/qianbao-tixians',
      handler: 'qianbao-tixian.create',
    },
    {
      method: 'PUT',
      path: '/api/qianbao-tixians/:id',
      handler: 'qianbao-tixian.update',
    },
    {
      method: 'DELETE',
      path: '/api/qianbao-tixians/:id',
      handler: 'qianbao-tixian.delete',
    },
    {
      method: 'POST',
      path: '/api/qianbao-tixians/:id/broadcast',
      handler: 'qianbao-tixian.broadcastWithdrawal',
    },
  ],
}; 