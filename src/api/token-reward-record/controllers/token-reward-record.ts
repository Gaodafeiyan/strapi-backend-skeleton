import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::token-reward-record.token-reward-record',
  ({ strapi }) => ({
    // 获取我的奖励记录
    async getMyRewards(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const records = await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
          filters: { user: userId },
          sort: { createdAt: 'desc' },
          populate: ['token']
        });
        
        ctx.body = {
          data: records
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    }
  })
); 