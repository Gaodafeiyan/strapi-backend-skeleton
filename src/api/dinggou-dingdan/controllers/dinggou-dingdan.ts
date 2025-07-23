import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::dinggou-dingdan.dinggou-dingdan',
  ({ strapi }) => ({
    async createWithPlan(ctx) {
      try {
        const { data } = ctx.request.body;
        const { jihuaId } = data || {};
        
        // 输入验证
        if (!jihuaId || typeof jihuaId !== 'number' || jihuaId <= 0) {
          return ctx.badRequest('计划ID无效');
        }
        
        const userId = ctx.state.user.id;
        if (!userId) {
          return ctx.unauthorized('用户未登录');
        }
        
        const order = await strapi
          .service('api::dinggou-dingdan.dinggou-dingdan')
          .createOrder(userId, jihuaId);
        
        ctx.body = { success: true, data: order };
      } catch (error) {
        console.error('创建订单错误:', error);
        ctx.throw(500, error instanceof Error ? error.message : '创建订单失败');
      }
    },

    async redeem(ctx) {
      try {
        const { id } = ctx.params;
        const { force, testMode } = ctx.request.body || {};
        
        // 输入验证
        if (!id || isNaN(Number(id)) || Number(id) <= 0) {
          return ctx.badRequest('订单ID无效');
        }
        
        const userId = ctx.state.user.id;
        if (!userId) {
          return ctx.unauthorized('用户未登录');
        }
        
        // 验证订单归属权
        const order = await strapi.entityService.findOne(
          'api::dinggou-dingdan.dinggou-dingdan',
          Number(id),
          { populate: ['yonghu'] }
        ) as any;
        
        if (!order) {
          return ctx.notFound('订单不存在');
        }
        
        if (order.yonghu.id !== userId) {
          return ctx.forbidden('无权操作此订单');
        }
        
        const result = await strapi.service('api::dinggou-dingdan.dinggou-dingdan').redeem(Number(id), { force, testMode });
        ctx.body = { success: true, data: result };
      } catch (error) {
        console.error('赎回订单错误:', error);
        
        // 区分业务逻辑错误和系统错误
        const errorMessage = error instanceof Error ? error.message : '赎回失败';
        
        if (errorMessage.includes('订单尚未到期') || 
            errorMessage.includes('订单不存在') || 
            errorMessage.includes('订单状态不允许') ||
            errorMessage.includes('投资计划不存在')) {
          return ctx.badRequest(errorMessage);
        }
        
        ctx.throw(500, errorMessage);
      }
    },
  })
); 