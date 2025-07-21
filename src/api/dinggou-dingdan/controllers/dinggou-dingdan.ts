import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::dinggou-dingdan.dinggou-dingdan',
  ({ strapi }) => ({
    async createWithPlan(ctx) {
      const { jihuaId } = ctx.request.body;
      const userId = ctx.state.user.id;
      const order = await strapi
        .service('api::dinggou-dingdan.dinggou-dingdan')
        .createOrder(userId, jihuaId);
      ctx.body = order;
    },

    async redeem(ctx) {
      const { id } = ctx.params;
      await strapi.service('api::dinggou-dingdan.dinggou-dingdan').redeem(Number(id));
      ctx.body = { ok: true };
    },
  })
); 