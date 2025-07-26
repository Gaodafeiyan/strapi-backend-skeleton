import { factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::choujiang-jihui.choujiang-jihui',
  ({ strapi }) => ({
    // 赠送抽奖机会
    async giveChance(params: { userId: number; jiangpinId: number; count?: number; reason?: string; type?: string }) {
      try {
        const { userId, jiangpinId, count = 1, reason = '系统赠送', type = 'reward' } = params;

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
        const chance = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui', {
          data: {
            user: userId,
            jiangpin: jiangpinId,
            reason,
            type,
            status: 'available',
            used: false,
            chuangJianShiJian: new Date(),
            zongCiShu: count,
            yiYongCiShu: 0,
            shengYuCiShu: count
          } as any
        });

        return chance;
      } catch (error) {
        console.error('赠送抽奖机会失败:', error);
        throw error;
      }
    },

    // 使用抽奖机会
    async useChance(chanceId: number, userId: number) {
      try {
        // 获取抽奖机会
        const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui', chanceId, {
          populate: ['jiangpin']
        });

        if (!chance) {
          throw new Error('抽奖机会不存在');
        }

        if ((chance as any).user !== userId) {
          throw new Error('无权使用此抽奖机会');
        }

        if ((chance as any).used) {
          throw new Error('抽奖机会已使用');
        }

        // 模拟抽奖结果（这里可以根据实际需求调整）
        const isWin = Math.random() < 0.3; // 30%中奖概率
        const result = isWin ? 'win' : 'lose';

        // 创建抽奖记录
        const lotteryRecord = await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu', {
          data: {
            user: userId,
            jihui: chanceId,
            jiangpin: (chance as any).jiangpin.id,
            result: 'success',
            status: 'completed'
          } as any
        });

        // 更新抽奖机会状态
        await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui', chanceId, {
          data: {
            used: true,
            status: 'used',
            yiYongCiShu: 1,
            shengYuCiShu: 0
          } as any
        });

        return {
          success: true,
          lotteryRecord,
          result,
          message: isWin ? '恭喜中奖！' : '很遗憾，未中奖'
        };
      } catch (error) {
        console.error('使用抽奖机会失败:', error);
        throw error;
      }
    },

    // 获取用户抽奖机会
    async getUserChances(userId: number) {
      try {
        const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
          filters: { user: userId } as any,
          sort: { createdAt: 'desc' },
          populate: ['jiangpin']
        });

        return chances;
      } catch (error) {
        console.error('获取用户抽奖机会失败:', error);
        throw error;
      }
    },

    // 获取用户抽奖统计
    async getUserChanceStats(userId: number) {
      try {
        const totalChances = await strapi.entityService.count('api::choujiang-jihui.choujiang-jihui', {
          filters: { user: userId } as any
        });

        const usedChances = await strapi.entityService.count('api::choujiang-jihui.choujiang-jihui', {
          filters: { 
            user: userId,
            used: true
          } as any
        });

        const availableChances = await strapi.entityService.count('api::choujiang-jihui.choujiang-jihui', {
          filters: { 
            user: userId,
            used: false,
            status: 'available'
          } as any
        });

        return {
          totalChances,
          usedChances,
          availableChances
        };
      } catch (error) {
        console.error('获取用户抽奖统计失败:', error);
        throw error;
      }
    }
  })
); 