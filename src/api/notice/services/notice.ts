import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::notice.notice' as any, ({ strapi }) => ({
  // 获取活跃的公告
  async getActiveNotices() {
    return await strapi.entityService.findMany('api::notice.notice' as any, {
      filters: {
        isActive: true,
        publishedAt: { $notNull: true }
      },
      sort: { priority: 'desc', createdAt: 'desc' },
      populate: '*'
    });
  },

  // 获取最新公告
  async getLatestNotices(limit = 5) {
    return await strapi.entityService.findMany('api::notice.notice' as any, {
      filters: {
        isActive: true,
        publishedAt: { $notNull: true }
      },
      sort: { priority: 'desc', createdAt: 'desc' },
      limit,
      populate: '*'
    });
  }
})); 