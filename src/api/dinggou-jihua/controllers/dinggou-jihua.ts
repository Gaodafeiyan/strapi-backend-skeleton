import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::dinggou-jihua.dinggou-jihua', ({ strapi }) => ({
  // 继承默认的CRUD操作

  // 获取活跃的投资计划
  async getActivePlans(ctx) {
    try {
      const plans = await strapi.entityService.findMany('api::dinggou-jihua.dinggou-jihua', {
        filters: { status: 'active' },
        sort: { createdAt: 'desc' }
      });
      
      ctx.body = { data: plans };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 创建投资计划
  async createPlan(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }

      const { name, amount, yield_rate, cycle_days, max_slots, description } = data;

      if (!name || !amount || !yield_rate || !cycle_days) {
        return ctx.badRequest('缺少必要字段');
      }

      const plan = await strapi.entityService.create('api::dinggou-jihua.dinggou-jihua', {
        data: {
          name,
          amount,
          yield_rate,
          cycle_days,
          max_slots: max_slots || 100,
          current_slots: 0,
          status: 'active',
          description: description || ''
        }
      });

      ctx.body = { data: plan };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 