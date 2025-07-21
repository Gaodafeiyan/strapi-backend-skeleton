import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    async addBalance(userId: number, usdt: string, ai: string = '0') {
      await strapi.db.connection.transaction(async (trx) => {
        const wallets = await strapi.entityService.findMany(
          'api::qianbao-yue.qianbao-yue',
          { filters: { yonghu: { id: userId } }, populate: ['yonghu'], transaction: trx }
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
          { data: { usdtYue: newUsdt, aiYue: newAi }, transaction: trx }
        );
      });
    },

    async deductBalance(userId: number, usdt: string) {
      await strapi.db.connection.transaction(async (trx) => {
        const wallet = await strapi.entityService.findMany(
          'api::qianbao-yue.qianbao-yue',
          { filters: { yonghu: { id: userId } }, populate: ['yonghu'], transaction: trx }
        ) as any;

        if (!wallet || wallet.length === 0) {
          throw new Error('钱包不存在');
        }

        const currentUsdt = new Decimal(wallet[0].usdtYue || 0);
        const deductAmount = new Decimal(usdt);
        
        if (currentUsdt.lessThan(deductAmount)) {
          throw new Error('余额不足');
        }

        const newUsdt = currentUsdt.minus(deductAmount).toFixed(2);

        await strapi.entityService.update(
          'api::qianbao-yue.qianbao-yue',
          wallet[0].id,
          { data: { usdtYue: newUsdt }, transaction: trx }
        );
      });
    },
  })
); 