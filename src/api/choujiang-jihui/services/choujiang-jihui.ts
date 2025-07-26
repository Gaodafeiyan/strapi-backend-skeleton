import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::choujiang-jihui.choujiang-jihui', ({ strapi }) => ({
  // 给用户赠送抽奖机会
  async giveChance(data) {
    try {
      const { userId, jiangpinId, count = 1, reason = '赠送抽奖机会', type = 'manual' } = data;

      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证奖品是否存在
      const jiangpin = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin', jiangpinId);
      if (!jiangpin) {
        throw new Error('奖品不存在');
      }

      // 创建抽奖机会记录
      const chances = [];
      for (let i = 0; i < count; i++) {
        const chance = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui', {
          data: {
            user: userId,
            jiangpin: jiangpinId,
            reason: reason,
            type: type,
            used: false
          }
        });
        chances.push(chance);
      }

      return {
        success: true,
        data: {
          userId,
          jiangpinId,
          count,
          chances: chances.map(chance => chance.id)
        }
      };
    } catch (error) {
      console.error('赠送抽奖机会失败:', error);
      throw error;
    }
  },

  // 使用抽奖机会
  async useChance(userId, chanceId) {
    try {
      // 获取抽奖机会
      const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui', chanceId, {
        populate: ['jiangpin']
      });

      if (!chance) {
        throw new Error('抽奖机会不存在');
      }

      if (chance.user !== userId) {
        throw new Error('无权使用此抽奖机会');
      }

      if (chance.used) {
        throw new Error('此抽奖机会已使用');
      }

      // 标记为已使用
      await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui', chanceId, {
        data: {
          used: true,
          used_at: new Date()
        }
      });

      // 创建抽奖记录
      const record = await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu', {
        data: {
          user: userId,
          jiangpin: chance.jiangpin.id,
          chance_id: chanceId,
          result: 'success'
        }
      });

      return {
        success: true,
        data: {
          chanceId,
          recordId: record.id,
          jiangpin: chance.jiangpin
        }
      };
    } catch (error) {
      console.error('使用抽奖机会失败:', error);
      throw error;
    }
  },

  // 获取用户抽奖机会
  async getUserChances(userId) {
    try {
      const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
        filters: { user: userId },
        populate: ['jiangpin'],
        sort: { createdAt: 'desc' }
      });

      return chances;
    } catch (error) {
      console.error('获取用户抽奖机会失败:', error);
      throw error;
    }
  },

  // 获取用户可用抽奖机会
  async getUserAvailableChances(userId) {
    try {
      const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
        filters: { 
          user: userId,
          used: false
        },
        populate: ['jiangpin'],
        sort: { createdAt: 'desc' }
      });

      return chances;
    } catch (error) {
      console.error('获取用户可用抽奖机会失败:', error);
      throw error;
    }
  }
})); 