import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::qianbao-tixian.qianbao-tixian', ({ strapi }) => ({
  // 自定义方法可以在这里添加
  async createWithdrawal(ctx) {
    const { toAddress, usdtJine, yonghu } = ctx.request.body;
    
    try {
      // 检查用户余额
      await strapi.service('api::qianbao-yue.qianbao-yue').deductBalance(
        yonghu, 
        usdtJine.toString()
      );
      
      const withdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
        data: {
          toAddress,
          usdtJine,
          zhuangtai: 'pending',
          yonghu
        }
      });
      
      ctx.body = { success: true, data: withdrawal };
    } catch (error) {
      ctx.throw(500, `创建提现记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  async broadcastWithdrawal(ctx) {
    const { id } = ctx.params;
    const { txHash } = ctx.request.body;
    
    try {
      const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', id);
      
      if (!withdrawal) {
        return ctx.notFound('提现记录不存在');
      }
      
      if (withdrawal.zhuangtai !== 'pending') {
        return ctx.badRequest('提现状态不允许广播');
      }
      
      // 更新状态为已广播
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', id, {
        data: { 
          zhuangtai: 'broadcasted',
          txHash
        }
      });
      
      ctx.body = { success: true, message: '提现已广播' };
    } catch (error) {
      ctx.throw(500, `广播提现失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
})); 