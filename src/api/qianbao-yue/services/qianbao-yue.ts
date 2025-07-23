import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    async addBalance(userId: number, usdt: string, ai: string = '0') {
      console.log('=== 钱包服务 addBalance 开始 ===');
      console.log('参数:', { userId, usdt, ai });
      
      try {
        // 使用事务和锁确保并发安全
        return await strapi.db.transaction(async (trx) => {
          const wallet = await trx.query('api::qianbao-yue.qianbao-yue').findOne({
            where: { yonghu: userId },
            lock: true
          });

          if (!wallet) {
            console.error('❌ 钱包不存在，用户ID:', userId);
            throw new Error('钱包不存在');
          }

          console.log('当前钱包信息:', {
            id: wallet.id,
            currentUsdt: wallet.usdtYue,
            currentAi: wallet.aiYue,
            userId: userId
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

          const updateResult = await trx.query('api::qianbao-yue.qianbao-yue').update({
            where: { id: wallet.id },
            data: { usdtYue: newUsdt, aiYue: newAi }
          });

          console.log('✅ 钱包更新成功:', {
            id: updateResult.id,
            newUsdt: updateResult.usdtYue,
            newAi: updateResult.aiYue
          });

          console.log('=== 钱包服务 addBalance 完成 ===');
          return updateResult;
        });

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
        // 使用事务和锁确保并发安全
        return await strapi.db.transaction(async (trx) => {
          const wallet = await trx.query('api::qianbao-yue.qianbao-yue').findOne({
            where: { yonghu: userId },
            lock: true
          });

          if (!wallet) {
            throw new Error('钱包不存在');
          }

          const currentUsdt = new Decimal(wallet.usdtYue || 0);
          const deductAmount = new Decimal(usdt);
          
          if (currentUsdt.lessThan(deductAmount)) {
            throw new Error('余额不足');
          }

          const newUsdt = currentUsdt.minus(deductAmount).toFixed(2);

          const updateResult = await trx.query('api::qianbao-yue.qianbao-yue').update({
            where: { id: wallet.id },
            data: { usdtYue: newUsdt }
          });

          console.log('✅ 钱包扣款成功:', {
            id: updateResult.id,
            newUsdt: updateResult.usdtYue
          });

          console.log('=== 钱包服务 deductBalance 完成 ===');
          return updateResult;
        });

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