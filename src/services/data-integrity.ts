import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::data-integrity.data-integrity', ({ strapi }) => ({
  // 检查用户数据完整性
  async checkUserDataIntegrity(userId) {
    try {
      // 检查钱包是否存在
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });

      if (wallets.length === 0) {
        // 创建钱包
        await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: userId
          }
        });
        console.log(`✅ 为用户 ${userId} 创建钱包`);
      }

      // 检查投资订单
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { user: userId }
      });

      // 检查抽奖机会
      const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
        filters: { user: userId }
      });

      // 检查代币奖励记录
      const rewards = await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
        filters: { user: userId }
      });

      return {
        success: true,
        data: {
          userId,
          hasWallet: wallets.length > 0,
          walletCount: wallets.length,
          orderCount: orders.length,
          chanceCount: chances.length,
          rewardCount: rewards.length
        }
      };
    } catch (error) {
      console.error('检查数据完整性失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 修复用户数据
  async fixUserData(userId) {
    try {
      // 检查并创建钱包
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });

      if (wallets.length === 0) {
        await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: userId
          }
        });
        console.log(`✅ 为用户 ${userId} 创建钱包`);
      }

      return {
        success: true,
        message: '数据修复完成'
      };
    } catch (error) {
      console.error('修复用户数据失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}));
