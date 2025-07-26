import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::choujiang-jihui.choujiang-jihui',
  ({ strapi }) => ({
    // 赠送抽奖机会
    async giveChance(ctx) {
      try {
        const { userId, jiangpinId, count = 1, reason, type = 'reward' } = ctx.request.body;
        
        if (!userId || !jiangpinId || !count) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        if (!user) {
          return ctx.badRequest('用户不存在');
        }

        // 验证奖品是否存在
        const jiangpin = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin', jiangpinId);
        if (!jiangpin) {
          return ctx.badRequest('奖品不存在');
        }

        // 创建抽奖机会记录
        const chance = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui', {
          data: {
            user: userId,
            jiangpin: jiangpinId,
            reason: reason || '系统赠送',
            type: type, // reward, invite, investment, etc.
            status: 'available',
            used: false,
            chuangJianShiJian: new Date(),
            zongCiShu: count,
            yiYongCiShu: 0,
            shengYuCiShu: count
          } as any
        });

        // 发送通知
        try {
          await strapi.service('api::notification.notification').sendInAppMessage(
            userId,
            '抽奖机会到账',
            `您获得了 ${count} 次抽奖机会`,
            'success'
          );
        } catch (notifyError) {
          console.error('发送通知失败:', notifyError);
        }

        ctx.body = {
          success: true,
          data: chance,
          message: '抽奖机会赠送成功'
        };
      } catch (error) {
        console.error('赠送抽奖机会失败:', error);
        ctx.throw(500, `赠送抽奖机会失败: ${error.message}`);
      }
    },

    // 使用抽奖机会
    async useChance(ctx) {
      try {
        const { chanceId } = ctx.request.body;
        const userId = ctx.state.user.id;
        
        if (!chanceId) {
          return ctx.badRequest('缺少抽奖机会ID');
        }

        // 获取抽奖机会
        const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui', chanceId, {
          populate: ['jiangpin']
        });

        if (!chance) {
          return ctx.badRequest('抽奖机会不存在');
        }

        if ((chance as any).user !== userId) {
          return ctx.forbidden('无权使用此抽奖机会');
        }

        if ((chance as any).used) {
          return ctx.badRequest('抽奖机会已使用');
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

        ctx.body = {
          success: true,
          data: {
            lotteryRecord,
            result,
            message: isWin ? '恭喜中奖！' : '很遗憾，未中奖'
          }
        };
      } catch (error) {
        console.error('使用抽奖机会失败:', error);
        ctx.throw(500, `使用抽奖机会失败: ${error.message}`);
      }
    },

    // 批量赠送抽奖机会
    async batchGiveChance(ctx) {
      try {
        const { chances } = ctx.request.body;
        
        if (!Array.isArray(chances) || chances.length === 0) {
          return ctx.badRequest('缺少抽奖机会数据');
        }

        const results = [];
        
        for (const chance of chances) {
          const { userId, jiangpinId, count = 1, reason, type = 'reward' } = chance;
          
          try {
            // 验证参数
            if (!userId || !jiangpinId || !count) {
              results.push({
                userId,
                success: false,
                error: '缺少必要参数'
              });
              continue;
            }

            // 验证用户是否存在
            const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
            if (!user) {
              results.push({
                userId,
                success: false,
                error: '用户不存在'
              });
              continue;
            }

            // 验证奖品是否存在
            const jiangpin = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin', jiangpinId);
            if (!jiangpin) {
              results.push({
                userId,
                success: false,
                error: '奖品不存在'
              });
              continue;
            }

            // 创建抽奖机会记录
            const chanceRecord = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui', {
              data: {
                user: userId,
                jiangpin: jiangpinId,
                reason: reason || '批量赠送',
                type: type,
                status: 'available',
                used: false,
                chuangJianShiJian: new Date(),
                zongCiShu: count,
                yiYongCiShu: 0,
                shengYuCiShu: count
              } as any
            });

            results.push({
              userId,
              success: true,
              chanceId: chanceRecord.id,
              message: '赠送成功'
            });

          } catch (error) {
            results.push({
              userId,
              success: false,
              error: error.message
            });
          }
        }

        ctx.body = {
          success: true,
          data: results,
          message: '批量赠送完成'
        };
      } catch (error) {
        console.error('批量赠送抽奖机会失败:', error);
        ctx.throw(500, `批量赠送抽奖机会失败: ${error.message}`);
      }
    },

    // 获取我的抽奖机会
    async getMyChances(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
          filters: { user: userId },
          sort: { createdAt: 'desc' },
          populate: ['jiangpin']
        });
        
        ctx.body = {
          data: chances
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 获取抽奖机会统计
    async getChanceStats(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const totalChances = await strapi.entityService.count('api::choujiang-jihui.choujiang-jihui', {
          filters: { user: userId }
        });
        
        const usedChances = await strapi.entityService.count('api::choujiang-jihui.choujiang-jihui', {
          filters: { 
            user: userId,
            used: true
          }
        });
        
        const availableChances = await strapi.entityService.count('api::choujiang-jihui.choujiang-jihui', {
          filters: { 
            user: userId,
            used: false,
            status: 'available'
          }
        });
        
        ctx.body = {
          data: {
            totalChances,
            usedChances,
            availableChances
          }
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    }
  })
); 