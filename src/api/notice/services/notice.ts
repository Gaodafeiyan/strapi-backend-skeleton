import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::notice.notice', ({ strapi }) => ({
  // 获取活跃的公告
  async getActiveNotices() {
    const now = new Date();
    
    return await strapi.entityService.findMany('api::notice.notice', {
      filters: {
        isActive: true,
        publishedAt: { $notNull: true },
        $or: [
          { publishDate: { $lte: now } },
          { publishDate: { $null: true } }
        ],
        $or: [
          { expireDate: { $gte: now } },
          { expireDate: { $null: true } }
        ]
      },
      sort: { priority: 'desc', createdAt: 'desc' },
      populate: '*'
    });
  },

  // 获取最新公告
  async getLatestNotices(limit = 5) {
    const now = new Date();
    
    return await strapi.entityService.findMany('api::notice.notice', {
      filters: {
        isActive: true,
        publishedAt: { $notNull: true },
        $or: [
          { publishDate: { $lte: now } },
          { publishDate: { $null: true } }
        ],
        $or: [
          { expireDate: { $gte: now } },
          { expireDate: { $null: true } }
        ]
      },
      sort: { priority: 'desc', createdAt: 'desc' },
      limit,
      populate: '*'
    });
  }
})); 