import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::choujiang-jihui.choujiang-jihui' as any, ({ strapi }) => ({
  // 为用户创建抽奖机会（订单赎回时调用）
  async createChoujiangJihui(userId: number, orderId: number, choujiangCi: number) {
    try {
      // 验证用户存在性
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        throw new Error(`用户ID ${userId} 不存在，无法创建抽奖机会`);
      }

      // 检查是否已存在抽奖机会
      const existingJihui = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui' as any, {
        filters: {
          yonghu: userId,
          dingdan: orderId,
          zhuangtai: 'active'
        }
      });

      if (existingJihui.length > 0) {
        console.log(`用户 ${userId} 订单 ${orderId} 已有抽奖机会`);
        return existingJihui[0];
      }

      // 创建新的抽奖机会
      const choujiangJihui = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui' as any, {
        data: {
          yonghu: { id: userId },
          dingdan: { id: orderId },
          zongCiShu: choujiangCi,
          yiYongCiShu: 0,
          shengYuCiShu: choujiangCi,
          zhuangtai: 'active',
          chuangJianShiJian: new Date(),
          daoQiShiJian: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
        }
      });

      console.log(`为用户 ${userId} 创建抽奖机会: ${choujiangCi} 次`);
      return choujiangJihui;
    } catch (error) {
      console.error('创建抽奖机会失败:', error);
      throw error;
    }
  },

  // 获取用户的抽奖机会
  async getUserChoujiangJihui(userId: number) {
    try {
      const jihuis = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui' as any, {
        filters: {
          yonghu: userId,
          zhuangtai: 'active'
        },
        populate: ['dingdan'],
        sort: { chuangJianShiJian: 'desc' }
      });

      return jihuis;
    } catch (error) {
      console.error('获取用户抽奖机会失败:', error);
      throw error;
    }
  },

  // 使用抽奖机会
  async useChoujiangJihui(jihuiId: number) {
    try {
      const jihui = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, jihuiId);
      
      if (!jihui) {
        throw new Error('抽奖机会不存在');
      }

      if ((jihui as any).shengYuCiShu <= 0) {
        throw new Error('抽奖机会已用完');
      }

      if ((jihui as any).zhuangtai !== 'active') {
        throw new Error('抽奖机会已过期或已用完');
      }

      // 更新抽奖机会
      const updatedJihui = await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, jihuiId, {
        data: {
          yiYongCiShu: (jihui as any).yiYongCiShu + 1,
          shengYuCiShu: (jihui as any).shengYuCiShu - 1,
          zhuangtai: (jihui as any).shengYuCiShu - 1 <= 0 ? 'used' : 'active'
        }
      });

      console.log(`用户使用抽奖机会: ${jihuiId}, 剩余次数: ${(updatedJihui as any).shengYuCiShu}`);
      return updatedJihui;
    } catch (error) {
      console.error('使用抽奖机会失败:', error);
      throw error;
    }
  },

  // 检查用户是否有可用抽奖机会
  async checkUserChoujiangJihui(userId: number) {
    try {
      const jihuis = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui' as any, {
        filters: {
          yonghu: userId,
          zhuangtai: 'active',
          shengYuCiShu: {
            $gt: 0
          }
        }
      });

      const totalRemaining = jihuis.reduce((sum, jihui) => sum + (jihui as any).shengYuCiShu, 0);
      
      return {
        hasJihui: jihuis.length > 0,
        totalRemaining,
        jihuis
      };
    } catch (error) {
      console.error('检查用户抽奖机会失败:', error);
      throw error;
    }
  }
})); 