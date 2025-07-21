import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::dinggou-dingdan.dinggou-dingdan',
  ({ strapi }) => ({
    /** 创建订单并锁定本金 */
    async createOrder(userId: number, jihuaId: number) {
      // 验证计划是否存在且开启
      const jihua = await strapi.entityService.findOne(
        'api::dinggou-jihua.dinggou-jihua',
        jihuaId
      ) as any;
      
      if (!jihua) {
        throw new Error('投资计划不存在');
      }
      
      if (!jihua.kaiqi) {
        throw new Error('该投资计划已关闭');
      }

      const { benjinUSDT, zhouQiTian, jingtaiBili, aiBili, choujiangCi } = jihua;

      // 验证用户是否存在
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userId
      ) as any;
      
      if (!user) {
        throw new Error('用户不存在');
      }

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
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      if (order.zhuangtai !== 'active') {
        throw new Error('订单状态不允许赎回');
      }
      
      if (new Date() < order.jieshuShiJian) {
        throw new Error('订单尚未到期');
      }

      const jihua = order.jihua;
      if (!jihua) {
        throw new Error('关联的投资计划不存在');
      }

      const staticUSDT = new Decimal(order.benjinUSDT).mul(jihua.jingtaiBili).div(100).toFixed(2);
      const aiQty = new Decimal(order.benjinUSDT).mul(jihua.aiBili).div(100).toFixed(8);

      // 使用事务确保数据一致性
      await strapi.db.connection.transaction(async (trx) => {
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
      });
    },
  })
); 