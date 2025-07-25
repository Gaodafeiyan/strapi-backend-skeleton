import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::yaoqing-jiangli.yaoqing-jiangli',
  ({ strapi }) => ({
    // 获取我的邀请记录
    async getMyInvites(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const invites = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
          filters: { tuijianRen: userId },
          sort: { createdAt: 'desc' },
          populate: ['laiyuanRen']
        });
        
        ctx.body = {
          data: invites
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 获取邀请统计
    async getInviteStats(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const totalInvites = await strapi.entityService.count('api::yaoqing-jiangli.yaoqing-jiangli', {
          filters: { tuijianRen: userId }
        });
        
        const totalRewards = await strapi.db.connection.raw(`
          SELECT COALESCE(SUM(shouyiUSDT), 0) as total
          FROM yaoqing_jianglis 
          WHERE tuijianRen = ?
        `, [userId]);
        
        ctx.body = {
          data: {
            totalInvites,
            totalRewards: totalRewards[0][0].total || 0
          }
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    }
  })
); 