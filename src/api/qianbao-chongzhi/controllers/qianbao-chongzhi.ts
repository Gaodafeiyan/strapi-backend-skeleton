import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::qianbao-chongzhi.qianbao-chongzhi', ({ strapi }) => ({
  // 继承默认的CRUD操作

  // 自定义方法可以在这里添加
  async createRecharge(ctx) {
    const { tx_hash, amount, user } = ctx.request.body;
    
    try {
      const recharge = await strapi.entityService.create('api::qianbao-chongzhi.qianbao-chongzhi', {
        data: {
          tx_hash,
          amount,
          status: 'pending',
          user
        } as any
      });
      
      ctx.body = { data: recharge };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 确认充值
  async confirmRecharge(ctx) {
    const { id } = ctx.params;
    
    try {
      const recharge = await strapi.entityService.findOne('api::qianbao-chongzhi.qianbao-chongzhi', id);
      
      if (!recharge) {
        return ctx.notFound('充值记录不存在');
      }
      
      if ((recharge as any).status === 'completed') {
        return ctx.badRequest('充值已确认');
      }
      
      // 更新状态为成功
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', id, {
        data: { status: 'completed' } as any
      });
      
      ctx.body = { data: { message: '充值确认成功' } };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 