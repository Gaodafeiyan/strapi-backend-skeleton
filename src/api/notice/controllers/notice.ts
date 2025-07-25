import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notice.notice' as any, ({ strapi }) => ({
  // 继承默认的CRUD操作

  // 获取活跃公告
  async getActiveNotices(ctx) {
    try {
      const notices = await strapi.service('api::notice.notice').getActiveNotices();
      ctx.body = { data: notices };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取最新公告
  async getLatestNotices(ctx) {
    try {
      const limit = parseInt(ctx.query.limit as string) || 5;
      const notices = await strapi.service('api::notice.notice').getLatestNotices(limit);
      ctx.body = { data: notices };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 重写find方法，默认只返回活跃的公告
  async find(ctx) {
    try {
      // 如果没有指定filters，默认只返回活跃的公告
      if (!ctx.query.filters) {
        ctx.query.filters = {
          isActive: true,
          publishedAt: { $notNull: true }
        };
      }
      
      const { data, meta } = await super.find(ctx);
      ctx.body = { data, meta };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取单个通知
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const notice = await strapi.entityService.findOne('api::notice.notice' as any, id);
      
      if (!notice) {
        return ctx.notFound('通知不存在');
      }
      
      ctx.body = { data: notice };
    } catch (error) {
      ctx.throw(500, `查询通知失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 创建通知
  async create(ctx) {
    try {
      const notice = await strapi.entityService.create('api::notice.notice' as any, {
        data: ctx.request.body,
      });
      
      ctx.body = { data: notice };
    } catch (error) {
      ctx.throw(500, `创建通知失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 更新通知
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const notice = await strapi.entityService.update('api::notice.notice' as any, id, {
        data: ctx.request.body,
      });
      
      ctx.body = { data: notice };
    } catch (error) {
      ctx.throw(500, `更新通知失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 删除通知
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      await strapi.entityService.delete('api::notice.notice' as any, id);
      
      ctx.body = { message: '通知删除成功' };
    } catch (error) {
      ctx.throw(500, `删除通知失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
})); 