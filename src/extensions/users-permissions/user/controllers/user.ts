import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  // 获取用户列表（仅管理员）
  async find(ctx) {
    try {
      const { page = 1, pageSize = 10, sort = 'createdAt:desc' } = ctx.query;
      
      // 检查用户权限
      const currentUser = ctx.state.user;
      if (!currentUser || currentUser.role?.type !== 'admin') {
        return ctx.forbidden('需要管理员权限');
      }
      
      const users = await strapi.entityService.findMany(
        'plugin::users-permissions.user',
        {
          sort: { createdAt: 'desc' },
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
          },
          populate: ['role']
        }
      );
      
      const total = await strapi.entityService.count('plugin::users-permissions.user');
      
      return {
        data: users,
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
          pageCount: Math.ceil(total / parseInt(pageSize as string)),
          total,
        },
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      ctx.throw(500, '获取用户列表失败');
    }
  },

  // 获取用户详情（仅管理员或用户本人）
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const currentUser = ctx.state.user;
      
      // 检查权限：管理员或用户本人
      if (!currentUser || (currentUser.role?.type !== 'admin' && currentUser.id !== parseInt(id))) {
        return ctx.forbidden('无权访问此用户信息');
      }
      
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        id,
        { populate: ['role'] }
      );
      
      if (!user) {
        return ctx.notFound('用户不存在');
      }
      
      return { data: user };
    } catch (error) {
      console.error('获取用户详情失败:', error);
      ctx.throw(500, '获取用户详情失败');
    }
  }
})); 