import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::dinggou-jihua.dinggou-jihua',
  ({ strapi }) => ({
    // 获取活跃的认购计划
    async getActivePlans(ctx) {
      try {
        const plans = await strapi.entityService.findMany('api::dinggou-jihua.dinggou-jihua', {
          filters: { kaiqi: true },
          sort: { createdAt: 'desc' }
        });
        
        ctx.body = {
          data: plans
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    }
  })
); 