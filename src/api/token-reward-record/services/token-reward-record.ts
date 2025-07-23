import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::token-reward-record.token-reward-record', ({ strapi }) => ({
  // 创建代币赠送记录
  async createTokenReward(userId: number, orderId: number, tokenId: number, amount: string, usdtValue: string, tokenPrice: string) {
    return await strapi.entityService.create('api::token-reward-record.token-reward-record', {
      data: {
        user: userId,
        order: orderId,
        token: tokenId,
        amount: parseFloat(amount),
        usdtValue: parseFloat(usdtValue),
        tokenPrice: parseFloat(tokenPrice)
      }
    });
  },

  // 获取用户的代币赠送记录
  async getUserTokenRewards(userId: number) {
    return await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
      filters: { user: { id: userId } },
      populate: {
        token: true,
        order: {
          populate: ['jihua']
        }
      },
      sort: { createdAt: 'desc' }
    });
  },

  // 获取订单的代币赠送记录
  async getOrderTokenRewards(orderId: number) {
    return await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
      filters: { order: { id: orderId } },
      populate: {
        token: true,
        user: {
          fields: ['id', 'username', 'email']
        }
      }
    });
  }
})); 