import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::choujiang-jiangpin.choujiang-jiangpin', ({ strapi }) => ({
  // 重写find方法，添加错误处理
  async find(ctx) {
    try {
      const { page = 1, pageSize = 10, sort = 'createdAt:desc' } = ctx.query;
      
      const prizes = await strapi.entityService.findMany(
        'api::choujiang-jiangpin.choujiang-jiangpin',
        {
          sort: { createdAt: 'desc' },
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
          },
        }
      );
      
      const total = await strapi.entityService.count('api::choujiang-jiangpin.choujiang-jiangpin');
      
      return {
        data: prizes,
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
          pageCount: Math.ceil(total / parseInt(pageSize as string)),
          total,
        },
      };
    } catch (error) {
      console.error('获取抽奖奖品列表失败:', error);
      ctx.throw(500, '获取抽奖奖品列表失败');
    }
  },

  // 重写findOne方法，添加错误处理
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      const prize = await strapi.entityService.findOne(
        'api::choujiang-jiangpin.choujiang-jiangpin',
        id
      );
      
      if (!prize) {
        return ctx.notFound('抽奖奖品不存在');
      }
      
      return { data: prize };
    } catch (error) {
      console.error('获取抽奖奖品详情失败:', error);
      ctx.throw(500, '获取抽奖奖品详情失败');
    }
  },

  // 获取活跃奖品列表
  async getActivePrizes(ctx) {
    try {
      const prizes = await strapi.entityService.findMany(
        'api::choujiang-jiangpin.choujiang-jiangpin',
        {
          filters: { kaiQi: true },
          sort: { paiXuShunXu: 'desc' }
        }
      );
      
      ctx.send({
        success: true,
        data: prizes
      });
    } catch (error) {
      console.error('获取活跃奖品失败:', error);
      ctx.throw(500, '获取活跃奖品失败');
    }
  }
})); 