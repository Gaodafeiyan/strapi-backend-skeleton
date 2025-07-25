import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::choujiang-ji-lu.choujiang-ji-lu' as any, ({ strapi }) => ({
  // 执行抽奖
  async performChoujiang(ctx) {
    try {
      const { jihuiId } = ctx.request.body;
      
      // 从认证状态获取用户ID
      const currentUserId = ctx.state.user?.id;
      
      if (!currentUserId) {
        return ctx.unauthorized('用户未登录');
      }

      if (!jihuiId) {
        return ctx.badRequest('缺少抽奖机会ID');
      }

      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', currentUserId);
      if (!user) {
        return ctx.badRequest(`用户ID ${currentUserId} 不存在`);
      }

      const result = await strapi.service('api::choujiang-ji-lu.choujiang-ji-lu').performChoujiang(currentUserId, jihuiId);

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
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        return ctx.unauthorized('用户未登录');
      }

      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        return ctx.badRequest(`用户ID ${userId} 不存在`);
      }

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
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        return ctx.unauthorized('用户未登录');
      }

      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        return ctx.badRequest(`用户ID ${userId} 不存在`);
      }

      const hasJihui = await strapi.service('api::choujiang-jihui.choujiang-jihui').checkUserHasJihui(userId);

      ctx.send({
        success: true,
        hasJihui: hasJihui
      });
    } catch (error) {
      console.error('检查抽奖机会失败:', error);
      ctx.badRequest(error.message || '检查抽奖机会失败');
    }
  },

  // 获取用户抽奖记录
  async getUserChoujiangRecords(ctx) {
    try {
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        return ctx.unauthorized('用户未登录');
      }

      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        return ctx.badRequest(`用户ID ${userId} 不存在`);
      }

      const records = await strapi.service('api::choujiang-ji-lu.choujiang-ji-lu').getUserChoujiangRecords(userId);

      ctx.send({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('获取抽奖记录失败:', error);
      ctx.badRequest(error.message || '获取抽奖记录失败');
    }
  },

  // 领取奖品
  async claimPrize(ctx) {
    try {
      const { recordId } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        return ctx.unauthorized('用户未登录');
      }

      if (!recordId) {
        return ctx.badRequest('缺少抽奖记录ID');
      }

      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        return ctx.badRequest(`用户ID ${userId} 不存在`);
      }

      const result = await strapi.service('api::choujiang-ji-lu.choujiang-ji-lu').claimPrize(recordId, userId);

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
      const prizes = await strapi.service('api::choujiang-jiangpin.choujiang-jiangpin').getActivePrizes();

      ctx.send({
        success: true,
        data: prizes
      });
    } catch (error) {
      console.error('获取奖品列表失败:', error);
      ctx.badRequest(error.message || '获取奖品列表失败');
    }
  },

  // 测试抽奖机会检查（仅管理员）
  async testCheckJihui(ctx) {
    try {
      const { userId } = ctx.query;
      
      if (!userId) {
        return ctx.badRequest('缺少用户ID参数');
      }

      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', Number(userId));
      if (!user) {
        return ctx.badRequest(`用户ID ${userId} 不存在`);
      }

      const hasJihui = await strapi.service('api::choujiang-jihui.choujiang-jihui').checkUserHasJihui(userId);

      ctx.send({
        success: true,
        userId: userId,
        hasJihui: hasJihui
      });
    } catch (error) {
      console.error('测试检查失败:', error);
      ctx.badRequest(error.message || '测试检查失败');
    }
  }
})); 