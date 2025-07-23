import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    // 继承默认的CRUD操作

    // 获取用户代币余额
    async getTokenBalances(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const wallet = await strapi.entityService.findOne('api::qianbao-yue.qianbao-yue', {
          filters: { yonghu: userId }
        });

        if (!wallet) {
          ctx.throw(404, '钱包不存在');
        }

        const tokenBalances = JSON.parse(wallet.aiTokenBalances || '{}');
        
        // 获取所有代币信息
        const tokens = await strapi.service('api::ai-token.ai-token').getActiveTokens();
        
        // 计算每个代币的总价值
        const balancesWithValue = await Promise.all(
          tokens.map(async (token) => {
            const balance = new Decimal(tokenBalances[token.id] || 0);
            let price = 0;
            
            try {
              price = await strapi.service('api::ai-token.ai-token').getTokenPrice(token.id);
            } catch (error) {
              console.error(`获取代币 ${token.name} 价格失败:`, error);
              price = 0.01; // 默认价格
            }
            
            const value = balance.mul(price).toFixed(2);
            
            return {
              id: token.id,
              name: token.name,
              symbol: token.symbol,
              balance: balance.toFixed(8),
              price: price.toFixed(8),
              value: value,
              logo: token.logoUrl,
              description: token.description
            };
          })
        );

        ctx.body = {
          success: true,
          data: balancesWithValue
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 获取用户代币赠送记录
    async getTokenRewardRecords(ctx) {
      try {
        const userId = ctx.state.user.id;
        const records = await strapi.service('api::token-reward-record.token-reward-record').getUserTokenRewards(userId);
        
        ctx.body = {
          success: true,
          data: records
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    }
  })
); 