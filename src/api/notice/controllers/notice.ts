import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notice.notice' as any, ({ strapi }) => ({
  // 获取所有通知
  async find(ctx) {
    try {
      const notices = await strapi.entityService.findMany('api::notice.notice' as any, {
        ...ctx.query,
        sort: { createdAt: 'desc' },
      });
      
      ctx.body = { data: notices };
    } catch (error) {
      ctx.throw(500, `获取通知失败: ${error instanceof Error ? error.message : '未知错误'}`);
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