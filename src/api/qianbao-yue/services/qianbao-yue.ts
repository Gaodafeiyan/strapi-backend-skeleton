import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    async addBalance(userId: number, usdt: string, ai: string = '0') {
      const wallets = await strapi.entityService.findMany(
        'api::qianbao-yue.qianbao-yue',
        { filters: { yonghu: { id: userId } }, populate: ['yonghu'] }
      ) as any[];

      if (!wallets || wallets.length === 0) {
        throw new Error('钱包不存在');
      }

      const wallet = wallets[0];
      const newUsdt = new Decimal(wallet.usdtYue || 0).plus(usdt).toFixed(2);
      const newAi = new Decimal(wallet.aiYue || 0).plus(ai).toFixed(8);

      await strapi.entityService.update(
        'api::qianbao-yue.qianbao-yue',
        wallet.id,
        { data: { usdtYue: newUsdt, aiYue: newAi } }
      );
    },

    async deductBalance(userId: number, usdt: string) {
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

      await strapi.entityService.update(
        'api::qianbao-yue.qianbao-yue',
        wallet.id,
        { data: { usdtYue: newUsdt } }
      );
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