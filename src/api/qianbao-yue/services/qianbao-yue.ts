import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    async addBalance(userId: number, usdt: string, ai: string = '0') {
      console.log('=== 钱包服务 addBalance 开始 ===');
      console.log('参数:', { userId, usdt, ai });
      
      try {
        const wallets = await strapi.entityService.findMany(
          'api::qianbao-yue.qianbao-yue',
          { filters: { yonghu: { id: userId } }, populate: ['yonghu'] }
        ) as any[];

        console.log('查询到的钱包数量:', wallets.length);

        if (!wallets || wallets.length === 0) {
          console.error('❌ 钱包不存在，用户ID:', userId);
          throw new Error('钱包不存在');
        }

        const wallet = wallets[0];
        console.log('当前钱包信息:', {
          id: wallet.id,
          currentUsdt: wallet.usdtYue,
          currentAi: wallet.aiYue,
          userId: wallet.yonghu?.id
        });

        const newUsdt = new Decimal(wallet.usdtYue || 0).plus(usdt).toFixed(2);
        const newAi = new Decimal(wallet.aiYue || 0).plus(ai).toFixed(8);

        console.log('计算新余额:', {
          oldUsdt: wallet.usdtYue,
          addUsdt: usdt,
          newUsdt: newUsdt,
          oldAi: wallet.aiYue,
          addAi: ai,
          newAi: newAi
        });

        const updateResult = await strapi.entityService.update(
          'api::qianbao-yue.qianbao-yue',
          wallet.id,
          { data: { usdtYue: newUsdt, aiYue: newAi } }
        );

        console.log('✅ 钱包更新成功:', {
          id: updateResult.id,
          newUsdt: updateResult.usdtYue,
          newAi: updateResult.aiYue
        });

        // 验证更新结果
        const verifyWallets = await strapi.entityService.findMany(
          'api::qianbao-yue.qianbao-yue',
          { filters: { yonghu: { id: userId } } }
        );

        if (verifyWallets.length > 0) {
          const verifyWallet = verifyWallets[0];
          console.log('验证结果:', {
            id: verifyWallet.id,
            finalUsdt: verifyWallet.usdtYue,
            finalAi: verifyWallet.aiYue
          });
        }

        console.log('=== 钱包服务 addBalance 完成 ===');
        return updateResult;

      } catch (error) {
        console.error('❌ 钱包服务 addBalance 失败:', error);
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
        throw error;
      }
    },

    async deductBalance(userId: number, usdt: string) {
      console.log('=== 钱包服务 deductBalance 开始 ===');
      console.log('参数:', { userId, usdt });
      
      try {
        const wallets = await strapi.entityService.findMany(
          'api::qianbao-yue.qianbao-yue',
          { filters: { yonghu: { id: userId } }, populate: ['yonghu'] }
        ) as any[];

        if (!wallets || wallets.length === 0) {
          throw new Error('钱包不存在');
        }

        const wallet = wallets[0];
        const currentUsdt = new Decimal(wallet.usdtYue || 0);
        const deductAmount = new Decimal(usdt);
        
        if (currentUsdt.lessThan(deductAmount)) {
          throw new Error('余额不足');
        }

        const newUsdt = currentUsdt.minus(deductAmount).toFixed(2);

        const updateResult = await strapi.entityService.update(
          'api::qianbao-yue.qianbao-yue',
          wallet.id,
          { data: { usdtYue: newUsdt } }
        );

        console.log('✅ 钱包扣款成功:', {
          id: updateResult.id,
          newUsdt: updateResult.usdtYue
        });

        console.log('=== 钱包服务 deductBalance 完成 ===');
        return updateResult;

      } catch (error) {
        console.error('❌ 钱包服务 deductBalance 失败:', error);
        throw error;
      }
    },

    // 新增：支持事务的余额操作方法（简化版本）
    async addBalanceWithTransaction(userId: number, usdt: number) {
      // 使用现有的addBalance方法，传入字符串格式
      await this.addBalance(userId, usdt.toString());
    },

    async deductBalanceWithTransaction(userId: number, usdt: number) {
      // 使用现有的deductBalance方法，传入字符串格式
      await this.deductBalance(userId, usdt.toString());
    },
  })
); 