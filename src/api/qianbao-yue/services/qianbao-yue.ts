import { factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    async addBalance(userId: number, usdt: string, ai: string = '0') {
      await strapi.db.connection.transaction(async (trx) => {
        const wallet = await strapi.entityService.findMany(
          'api::qianbao-yue.qianbao-yue',
          { filters: { yonghu: userId }, populate: ['yonghu'], transaction: trx }
        );

        const newUsdt = (parseFloat(wallet[0].usdtYue || '0') + parseFloat(usdt)).toFixed(2);
        const newAi = (parseFloat(wallet[0].aiYue || '0') + parseFloat(ai)).toFixed(8);

        await strapi.entityService.update(
          'api::qianbao-yue.qianbao-yue',
          wallet[0].id,
          { data: { usdtYue: newUsdt, aiYue: newAi }, transaction: trx }
        );
      });
    },

    async deductBalance(userId: number, usdt: string) {
      await strapi.db.connection.transaction(async (trx) => {
        const wallet = await strapi.entityService.findMany(
          'api::qianbao-yue.qianbao-yue',
          { filters: { yonghu: userId }, populate: ['yonghu'], transaction: trx }
        );

        const currentUsdt = parseFloat(wallet[0].usdtYue || '0');
        const deductAmount = parseFloat(usdt);
        
        if (currentUsdt < deductAmount) {
          throw new Error('余额不足');
        }

        const newUsdt = (currentUsdt - deductAmount).toFixed(2);

        await strapi.entityService.update(
          'api::qianbao-yue.qianbao-yue',
          wallet[0].id,
          { data: { usdtYue: newUsdt }, transaction: trx }
        );
      });
    },
  })
); 