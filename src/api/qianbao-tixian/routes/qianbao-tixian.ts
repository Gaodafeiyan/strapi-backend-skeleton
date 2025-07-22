export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/qianbao-tixians',
      handler: 'qianbao-tixian.find',
    },
    {
      method: 'GET',
      path: '/qianbao-tixians/:id',
      handler: 'qianbao-tixian.findOne',
    },
    {
      method: 'POST',
      path: '/qianbao-tixians',
      handler: 'qianbao-tixian.create',
    },
    {
      method: 'PUT',
      path: '/qianbao-tixians/:id',
      handler: 'qianbao-tixian.update',
    },
    {
      method: 'DELETE',
      path: '/qianbao-tixians/:id',
      handler: 'qianbao-tixian.delete',
    },
    {
      method: 'POST',
      path: '/qianbao-tixians/:id/broadcast',
      handler: 'qianbao-tixian.broadcastWithdrawal',
    },
  ],
}; 