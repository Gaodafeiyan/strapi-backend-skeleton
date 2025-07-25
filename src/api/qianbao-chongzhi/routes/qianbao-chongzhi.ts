export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/qianbao-chongzhis/deposit-address',
      handler: 'qianbao-chongzhi.getDepositAddress',
    },
    {
      method: 'POST',
      path: '/api/qianbao-chongzhis/:id/confirm',
      handler: 'qianbao-chongzhi.confirmRecharge',
    },
    {
      method: 'GET',
      path: '/api/qianbao-chongzhis',
      handler: 'qianbao-chongzhi.find',
    },
    {
      method: 'GET',
      path: '/api/qianbao-chongzhis/:id',
      handler: 'qianbao-chongzhi.findOne',
    },
    {
      method: 'POST',
      path: '/api/qianbao-chongzhis',
      handler: 'qianbao-chongzhi.create',
    },
    {
      method: 'PUT',
      path: '/api/qianbao-chongzhis/:id',
      handler: 'qianbao-chongzhi.update',
    },
    {
      method: 'DELETE',
      path: '/api/qianbao-chongzhis/:id',
      handler: 'qianbao-chongzhi.delete',
    },
  ],
}; 