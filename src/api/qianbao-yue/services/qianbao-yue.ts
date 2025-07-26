import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService('api::qianbao-yue.qianbao-yue', ({ strapi }) => ({
  // 获取用户钱包
  async getUserWallet(userId) {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });
      
      let wallet = wallets[0];
      if (!wallet) {
        // 如果钱包不存在，创建钱包
        wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: userId
          }
        });
      }
      
      return wallet;
    } catch (error) {
      console.error('获取用户钱包失败:', error);
      throw error;
    }
  },

  // 更新钱包余额
  async updateWalletBalance(userId, updates) {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });
      
      let wallet = wallets[0];
      if (!wallet) {
        // 如果钱包不存在，创建钱包
        wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: userId
          }
        });
      }

      // 更新钱包余额
      const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: updates
      });

      return updatedWallet;
    } catch (error) {
      console.error('更新钱包余额失败:', error);
      throw error;
    }
  },

  // 充值钱包
  async rechargeWallet(userId, rechargeData) {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });
      
      let wallet = wallets[0];
      if (!wallet) {
        wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: userId
          }
        });
      }

      // 计算新的余额
      const currentUsdt = parseFloat(wallet.usdtYue || '0');
      const currentAi = parseFloat(wallet.aiYue || '0');
      
      const newUsdt = currentUsdt + parseFloat(rechargeData.usdtYue || '0');
      const newAi = currentAi + parseFloat(rechargeData.aiYue || '0');

      // 更新钱包余额
      const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: {
          usdtYue: newUsdt.toString(),
          aiYue: newAi.toString(),
          ...(rechargeData.aiTokenBalances && { aiTokenBalances: rechargeData.aiTokenBalances })
        }
      });

      return updatedWallet;
    } catch (error) {
      console.error('充值钱包失败:', error);
      throw error;
    }
  },

  // 获取用户代币余额
  async getTokenBalances(userId) {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });
      
      let wallet = wallets[0];
      if (!wallet) {
        wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: userId
          }
        });
      }

      const tokenBalances = JSON.parse(wallet.aiTokenBalances || '{}');
      
      // 获取所有代币信息
      const tokens = await strapi.service('api::ai-token.ai-token').getActiveTokens();
      
      // 计算每个代币的总价值
      const balancesWithValue = await Promise.all(
        tokens.map(async (token) => {
          const balance = parseFloat(tokenBalances[token.id] || '0');
          let price = 0;
          
          try {
            price = await strapi.service('api::ai-token.ai-token').getTokenPrice(token.id);
          } catch (error) {
            console.error(`获取代币 ${token.name} 价格失败:`, error);
            price = 0.01; // 默认价格
          }
          
          const value = balance * price;
          
          return {
            id: token.id,
            name: token.name,
            symbol: token.symbol,
            balance: balance.toFixed(8),
            price: price.toFixed(8),
            value: value.toFixed(2),
            logo: token.logo_url,
            description: token.description
          };
        })
      );

      return balancesWithValue;
    } catch (error) {
      console.error('获取代币余额失败:', error);
      throw error;
    }
  }
})); 