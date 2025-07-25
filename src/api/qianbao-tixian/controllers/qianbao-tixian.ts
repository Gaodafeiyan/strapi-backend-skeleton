import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::qianbao-tixian.qianbao-tixian' as any, ({ strapi }) => ({
  // 标准create方法 - 使用队列系统
  async create(ctx) {
    const { data } = ctx.request.body;
    const userId = ctx.state.user?.id;
    
    if (!userId) {
      return ctx.unauthorized('用户未登录');
    }
    
    // 验证data字段是否存在
    if (!data) {
      return ctx.badRequest('缺少data字段');
    }
    
    // 验证必要字段
    if (!data.usdtJine) {
      return ctx.badRequest('缺少提现金额');
    }
    
    if (!data.tixianAddress && !data.toAddress) {
      return ctx.badRequest('缺少提现地址');
    }
    
    try {
      // 使用队列服务创建提现
      const withdrawal = await strapi.service('api::qianbao-tixian.qianbao-tixian').requestWithdraw(
        userId, 
        data.usdtJine,
        data.tixianAddress || data.toAddress
      );
      
      ctx.body = { data: withdrawal };
    } catch (error) {
      ctx.throw(500, `创建提现记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 标准find方法
  async find(ctx) {
    try {
      const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian' as any, {
        ...ctx.query,
        populate: ['yonghu']
      });
      
      ctx.body = { data: withdrawals };
    } catch (error) {
      ctx.throw(500, `查询提现记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 标准findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian' as any, id, {
        ...ctx.query,
        populate: ['yonghu']
      });
      
      if (!withdrawal) {
        return ctx.notFound('提现记录不存在');
      }
      
      ctx.body = { data: withdrawal };
    } catch (error) {
      ctx.throw(500, `查询提现记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 标准update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      
      const withdrawal = await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian' as any, id, {
        data,
        ...ctx.query,
        populate: ['yonghu']
      });
      
      if (!withdrawal) {
        return ctx.notFound('提现记录不存在');
      }
      
      ctx.body = { data: withdrawal };
    } catch (error) {
      ctx.throw(500, `更新提现记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 自定义方法可以在这里添加
  async createWithdrawal(ctx) {
    const { toAddress, usdtJine, yonghu } = ctx.request.body;
    
    try {
      // 使用新的队列服务
      const withdrawal = await strapi.service('api::qianbao-tixian.qianbao-tixian').requestWithdraw(
        yonghu, 
        usdtJine,
        toAddress
      );
      
      ctx.body = { success: true, data: withdrawal };
    } catch (error) {
      ctx.throw(500, `创建提现记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  async broadcastWithdrawal(ctx) {
    const { id } = ctx.params;
    const { txHash } = ctx.request.body;
    
    try {
      const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian' as any, id, {
        populate: ['yonghu']
      });
      
      if (!withdrawal) {
        return ctx.notFound('提现记录不存在');
      }
      
      if ((withdrawal as any).zhuangtai !== 'pending') {
        return ctx.badRequest('提现状态不允许广播');
      }
      
      // 更新状态为已广播
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian' as any, id, {
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