import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    // 获取用户钱包
    async getUserWallet(userId: number) {
      try {
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
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
            } as any
          });
        }
        
        return wallet;
      } catch (error) {
        console.error('获取用户钱包失败:', error);
        throw error;
      }
    },

    // 扣除余额
    async deductBalance(userId: number, amount: string) {
      try {
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
        });
        
        const wallet = wallets[0];
        if (!wallet) {
          throw new Error('用户钱包不存在');
        }

        const currentBalance = new Decimal(wallet.usdtYue || '0');
        const deductAmount = new Decimal(amount);
        
        if (currentBalance.lessThan(deductAmount)) {
          throw new Error('余额不足');
        }

        const newBalance = currentBalance.minus(deductAmount).toString();
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            usdtYue: newBalance
          }
        });

        return { success: true, newBalance };
      } catch (error) {
        console.error('扣除余额失败:', error);
        throw error;
      }
    },

    // 增加余额
    async addBalance(userId: number, amount: string) {
      try {
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
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
            } as any
          });
        }

        const currentBalance = new Decimal(wallet.usdtYue || '0');
        const addAmount = new Decimal(amount);
        const newBalance = currentBalance.plus(addAmount).toString();
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            usdtYue: newBalance
          }
        });

        return { success: true, newBalance };
      } catch (error) {
        console.error('增加余额失败:', error);
        throw error;
      }
    },

    // 更新AI代币余额
    async updateAiTokenBalance(userId: number, tokenId: number, amount: string) {
      try {
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
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
            } as any
          });
        }

        const currentBalances = JSON.parse(String(wallet.aiTokenBalances || '{}'));
        const currentBalance = new Decimal(currentBalances[tokenId] || '0');
        const newBalance = currentBalance.plus(amount).toString();
        currentBalances[tokenId] = newBalance;

        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            aiTokenBalances: JSON.stringify(currentBalances)
          }
        });

        return { success: true, newBalance };
      } catch (error) {
        console.error('更新AI代币余额失败:', error);
        throw error;
      }
    }
  })
); 