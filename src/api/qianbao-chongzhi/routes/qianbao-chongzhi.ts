import { factories } from '@strapi/strapi';

export default {
  type: 'content-api',
  routes: [
    // 只保留实际存在的自定义方法
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