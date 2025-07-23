import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::choujiang-ji-lu.choujiang-ji-lu' as any, ({ strapi }) => ({
  // 执行抽奖
  async performChoujiang(ctx) {
    try {
      const { jihuiId } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!jihuiId) {
        return ctx.badRequest('缺少抽奖机会ID');
      }

      const result = await strapi.service('api::choujiang-ji-lu.choujiang-ji-lu').performChoujiang(userId, jihuiId);

      ctx.send({
        success: true,
        message: '抽奖成功',
        data: result
      });
    } catch (error) {
      console.error('抽奖失败:', error);
      ctx.badRequest(error.message || '抽奖失败');
    }
  },

  // 获取用户抽奖机会
  async getUserChoujiangJihui(ctx) {
    try {
      const userId = ctx.state.user.id;
      const jihuis = await strapi.service('api::choujiang-jihui.choujiang-jihui').getUserChoujiangJihui(userId);

      ctx.send({
        success: true,
        data: jihuis
      });
    } catch (error) {
      console.error('获取抽奖机会失败:', error);
      ctx.badRequest(error.message || '获取抽奖机会失败');
    }
  },

  // 检查用户抽奖机会
  async checkUserChoujiangJihui(ctx) {
    try {
      const userId = ctx.state.user.id;
      const result = await strapi.service('api::choujiang-jihui.choujiang-jihui').checkUserChoujiangJihui(userId);

      ctx.send({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('检查抽奖机会失败:', error);
      ctx.badRequest(error.message || '检查抽奖机会失败');
    }
  },

  // 获取用户抽奖记录
  async getUserChoujiangRecords(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { limit = 20, offset = 0 } = ctx.query;

      const records = await strapi.service('api::choujiang-ji-lu.choujiang-ji-lu').getUserChoujiangRecords(
        userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );

      ctx.send({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('获取抽奖记录失败:', error);
      ctx.badRequest(error.message || '获取抽奖记录失败');
    }
  },

  // 领取实物奖品
  async claimPhysicalPrize(ctx) {
    try {
      const { recordId } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!recordId) {
        return ctx.badRequest('缺少记录ID');
      }

      // 验证记录是否属于当前用户
      const record = await strapi.entityService.findOne('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId);
      if (!record || (record as any).yonghu?.id !== userId) {
        return ctx.forbidden('无权操作此记录');
      }

      const result = await strapi.service('api::choujiang-ji-lu.choujiang-ji-lu').claimPhysicalPrize(recordId);

      ctx.send({
        success: true,
        message: '奖品领取成功',
        data: result
      });
    } catch (error) {
      console.error('领取奖品失败:', error);
      ctx.badRequest(error.message || '领取奖品失败');
    }
  },

  // 获取抽奖奖品列表（公开接口）
  async getChoujiangPrizes(ctx) {
    try {
      const prizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        filters: {
          kaiQi: true
        },
        sort: { paiXuShunXu: 'asc' }
      });

      ctx.send({
        success: true,
        data: prizes
      });
    } catch (error) {
      console.error('获取奖品列表失败:', error);
      ctx.badRequest(error.message || '获取奖品列表失败');
    }
  }
})); 