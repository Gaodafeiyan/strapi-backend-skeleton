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
    },

    // 重写create方法，添加参数验证
    async create(ctx) {
      const { data } = ctx.request.body;
      
      // 验证data字段是否存在
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }
      
      // 验证必要字段
      if (!data.name) {
        return ctx.badRequest('缺少计划名称');
      }
      
      if (!data.jine) {
        return ctx.badRequest('缺少投资金额');
      }
      
      if (!data.qixian) {
        return ctx.badRequest('缺少投资期限');
      }
      
      try {
        const plan = await strapi.entityService.create('api::dinggou-jihua.dinggou-jihua', {
          data: {
            ...data,
            kaiqi: data.kaiqi !== undefined ? data.kaiqi : true
          }
        });
        
        ctx.body = { data: plan };
      } catch (error) {
        ctx.throw(500, `创建投资计划失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  })
); 