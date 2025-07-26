import { factories } from '@strapi/strapi';

export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
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
    // 自定义方法
    {
      method: 'POST',
      path: '/qianbao-chongzhis/create-recharge',
      handler: 'qianbao-chongzhi.createRecharge',
      config: {
        policies: [],
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/qianbao-chongzhis/:id/confirm',
      handler: 'qianbao-chongzhi.confirmRecharge',
      config: {
        policies: [],
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 