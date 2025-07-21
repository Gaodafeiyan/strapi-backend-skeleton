import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::dinggou-dingdan.dinggou-dingdan',
  ({ strapi }) => ({
    /** 创建订单并锁定本金 */
    async createOrder(userId: number, jihuaId: number) {
      const jihua = await strapi.entityService.findOne(
        'api::dinggou-jihua.dinggou-jihua',
        jihuaId
      ) as any;
      const { benjinUSDT, zhouQiTian, jingtaiBili, aiBili, choujiangCi } = jihua;

      // ① 扣钱包本金
      await strapi
        .service('api::qianbao-yue.qianbao-yue')
        .deductBalance(userId, benjinUSDT);

      // ② 写订单
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + zhouQiTian);
      
      return strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
        data: {
          benjinUSDT,
          kaishiShiJian: new Date(),
          jieshuShiJian: endDate,
          yonghu: userId,
          jihua: jihuaId,
        },
      });
    },

    /** 到期赎回 */
    async redeem(orderId: number) {
      const order = await strapi.entityService.findOne(
        'api::dinggou-dingdan.dinggou-dingdan',
        orderId,
        { populate: ['jihua', 'yonghu'] }
      ) as any;
      
      if (!order || order.zhuangtai !== 'active') return;
      if (new Date() < order.jieshuShiJian) return;

      const jihua = order.jihua;
      const staticUSDT = new Decimal(order.benjinUSDT).mul(jihua.jingtaiBili).div(100).toFixed(2);

      const aiQty = new Decimal(order.benjinUSDT).mul(jihua.aiBili).div(100).toFixed(8);

      // ① 钱包加钱
      await strapi
        .service('api::qianbao-yue.qianbao-yue')
        .addBalance(order.yonghu.id, staticUSDT, aiQty);

      // ② 计算邀请奖励
      await strapi
        .service('api::yaoqing-jiangli.yaoqing-jiangli')
        .createReferralReward(order);

      // ③ 更新订单
      await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        data: {
          zhuangtai: 'finished',
          jingtaiShouyi: staticUSDT,
          aiShuliang: aiQty,
        },
      });
    },
  })
); 