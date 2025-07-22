export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/qianbao-chongzhis',
      handler: 'qianbao-chongzhi.find',
    },
    {
      method: 'GET',
      path: '/qianbao-chongzhis/:id',
      handler: 'qianbao-chongzhi.findOne',
    },
    {
      method: 'POST',
      path: '/qianbao-chongzhis',
      handler: 'qianbao-chongzhi.create',
    },
    {
      method: 'PUT',
      path: '/qianbao-chongzhis/:id',
      handler: 'qianbao-chongzhi.update',
    },
    {
      method: 'DELETE',
      path: '/qianbao-chongzhis/:id',
      handler: 'qianbao-chongzhi.delete',
    },
    {
      method: 'POST',
      path: '/qianbao-chongzhis/:id/confirm',
      handler: 'qianbao-chongzhi.confirmRecharge',
    },
  ],
}; 