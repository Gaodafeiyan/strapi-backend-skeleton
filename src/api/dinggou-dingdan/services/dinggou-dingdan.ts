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
    async redeem(orderId: number, options: { force?: boolean; testMode?: boolean } = {}) {
      const { force = false, testMode = false } = options;
      
      const order = await strapi.entityService.findOne(
        'api::dinggou-dingdan.dinggou-dingdan',
        orderId,
        { 
          populate: {
            jihua: true,
            yonghu: {
              populate: ['shangji']
            }
          }
        }
      ) as any;
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      // 允许 active 和 redeemable 状态赎回
      if (order.zhuangtai !== 'active' && order.zhuangtai !== 'redeemable') {
        throw new Error('订单状态不允许赎回');
      }
      
      const now = new Date();
      // 确保时间字段是Date对象
      const startTime = new Date(order.kaishiShiJian);
      const endTime = new Date(order.jieshuShiJian);
      const isExpired = now >= endTime;
      
      // 如果订单状态是 active 但已过期，自动标记为 redeemable
      if (order.zhuangtai === 'active' && isExpired && !force && !testMode) {
        await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
          data: { zhuangtai: 'redeemable' }
        });
        throw new Error('订单已到期，请重新点击赎回');
      }
      
      // 如果订单未到期且不是强制赎回，则不允许赎回
      if (!isExpired && !force && !testMode) {
        const remainingMs = endTime.getTime() - now.getTime();
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
        
        let timeMessage = '';
        if (remainingDays > 0) {
          timeMessage = `还需等待 ${remainingDays} 天`;
        } else if (remainingHours > 0) {
          timeMessage = `还需等待 ${remainingHours} 小时`;
        } else if (remainingMinutes > 0) {
          timeMessage = `还需等待 ${remainingMinutes} 分钟`;
        } else {
          timeMessage = '即将到期';
        }
        
        throw new Error(`订单尚未到期，${timeMessage}`);
      }

      const jihua = order.jihua;
      if (!jihua) {
        throw new Error('关联的投资计划不存在');
      }

      // 计算收益
      let staticUSDT, aiQty;
      
      if (isExpired || force || testMode) {
        // 正常到期或强制赎回：按计划比例计算
        staticUSDT = new Decimal(order.benjinUSDT).mul(jihua.jingtaiBili).div(100).toFixed(2);
        aiQty = new Decimal(order.benjinUSDT).mul(jihua.aiBili).div(100).toFixed(8);
      } else {
        // 未到期赎回：按实际时间比例计算
        const totalMs = endTime.getTime() - startTime.getTime();
        const actualMs = now.getTime() - startTime.getTime();
        const ratio = Math.max(0, actualMs / totalMs);
        
        staticUSDT = new Decimal(order.benjinUSDT).mul(jihua.jingtaiBili).div(100).mul(ratio).toFixed(2);
        aiQty = new Decimal(order.benjinUSDT).mul(jihua.aiBili).div(100).mul(ratio).toFixed(8);
      }

      try {
        // ① 钱包加钱
        await strapi
          .service('api::qianbao-yue.qianbao-yue')
          .addBalance(order.yonghu.id, staticUSDT, aiQty);

        // ② 计算邀请奖励（仅到期时）
        if (isExpired || force) {
          try {
            console.log('开始创建邀请奖励，订单ID:', orderId);
            console.log('用户信息:', {
              userId: order.yonghu.id,
              username: order.yonghu.username,
              shangji: order.yonghu.shangji
            });
            
            await strapi
              .service('api::yaoqing-jiangli.yaoqing-jiangli')
              .createReferralReward(order);
              
            console.log('邀请奖励创建成功');
          } catch (rewardError) {
            console.error('邀请奖励创建失败:', rewardError);
            // 邀请奖励失败不影响主流程
          }
        }

        // ③ 更新订单
        await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
          data: {
            zhuangtai: 'finished',
            jingtaiShouyi: staticUSDT,
            aiShuliang: aiQty,
          },
        });

        return {
          success: true,
          data: {
            orderId,
            benjinUSDT: order.benjinUSDT,
            staticUSDT,
            aiQty,
            isExpired,
            force,
            testMode,
            startTime: startTime,
            endTime: endTime,
            currentTime: now
          }
        };
      } catch (error) {
        throw new Error(`赎回失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },
  })
); 