import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::data-integrity.data-integrity', ({ strapi }) => ({
  // 验证数据是否存在
  async validateDataExists(entityType: any, id: number) {
    try {
      const entity = await strapi.entityService.findOne(entityType, id);
      if (!entity) {
        throw new Error(`${entityType} with ID ${id} does not exist`);
      }
      return entity;
    } catch (error) {
      throw new Error(`数据验证失败: ${error.message}`);
    }
  },

  // 验证用户是否存在
  async validateUserExists(userId: number) {
    return await strapi.entityService.findOne('plugin::users-permissions.user', userId);
  },

  // 验证认购计划是否存在
  async validateDinggouPlanExists(planId: number) {
    return await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
  },

  // 验证钱包是否存在
  async validateWalletExists(walletId: number) {
    return await strapi.entityService.findOne('api::qianbao-yue.qianbao-yue', walletId);
  },

  // 检查用户钱包是否存在，不存在则创建
  async ensureUserWalletExists(userId: number) {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { yonghu: { $eq: userId } }
      });
      
      if (wallets.length > 0) {
        return wallets[0];
      }
      
      // 创建新钱包
      const newWallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
        data: {
          usdtYue: '0',
          aiYue: '0',
          aiTokenBalances: '{}',
          yonghu: userId
        }
      });
      
      return newWallet;
    } catch (error) {
      throw new Error(`确保用户钱包存在失败: ${error.message}`);
    }
  }
}));
