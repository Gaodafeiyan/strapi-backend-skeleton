import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::qianbao-chongzhi.qianbao-chongzhi', ({ strapi }) => ({
  // 标准create方法
  async create(ctx) {
    const { data } = ctx.request.body;
    
    try {
      const recharge = await strapi.entityService.create('api::qianbao-chongzhi.qianbao-chongzhi', {
        data: {
          ...data,
          zhuangtai: 'pending'
        }
      });
      
      ctx.body = { data: recharge };
    } catch (error) {
      ctx.throw(500, `创建充值记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 标准find方法
  async find(ctx) {
    try {
      const recharges = await strapi.entityService.findMany('api::qianbao-chongzhi.qianbao-chongzhi', {
        ...ctx.query,
        populate: ['yonghu']
      });
      
      ctx.body = { data: recharges };
    } catch (error) {
      ctx.throw(500, `查询充值记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 自定义方法可以在这里添加
  async createRecharge(ctx) {
    const { txHash, usdtJine, yonghu } = ctx.request.body;
    
    try {
      const recharge = await strapi.entityService.create('api::qianbao-chongzhi.qianbao-chongzhi', {
        data: {
          txHash,
          usdtJine,
          zhuangtai: 'pending',
          yonghu
        }
      });
      
      ctx.body = { success: true, data: recharge };
    } catch (error) {
      ctx.throw(500, `创建充值记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  async confirmRecharge(ctx) {
    const { id } = ctx.params;
    
    try {
      const recharge = await strapi.entityService.findOne('api::qianbao-chongzhi.qianbao-chongzhi', id, {
        populate: ['yonghu']
      });
      
      if (!recharge) {
        return ctx.notFound('充值记录不存在');
      }
      
      if (recharge.zhuangtai === 'success') {
        return ctx.badRequest('充值已确认');
      }
      
      // 更新状态为成功
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', id, {
        data: { zhuangtai: 'success' }
      });
      
      // 增加用户余额
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        (recharge as any).yonghu.id, 
        (recharge as any).usdtJine.toString()
      );
      
      ctx.body = { success: true, message: '充值确认成功' };
    } catch (error) {
      ctx.throw(500, `确认充值失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
})); 