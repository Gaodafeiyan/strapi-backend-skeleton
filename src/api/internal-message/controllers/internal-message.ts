import { factories } from '@strapi/strapi';

// 发送推送通知的辅助函数
async function sendPushNotification(strapi: any, userId: number, title: string, content: string) {
  try {
    // 这里可以集成实际的推送服务，如Firebase、极光推送等
    console.log(`发送推送通知给用户 ${userId}: ${title} - ${content}`);
    
    // 示例：发送到WebSocket
    if (strapi.io) {
      strapi.io.to(`user_${userId}`).emit('notification', {
        title,
        content,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('发送推送通知失败:', error);
  }
}

export default factories.createCoreController('api::internal-message.internal-message' as any, ({ strapi }) => ({
  /**
   * 发送消息给用户
   */
  async sendMessage(ctx) {
    try {
      const { userId, title, content, type = 'system', priority = 'normal' } = ctx.request.body;
      
      if (!userId || !title || !content) {
        return ctx.badRequest('缺少必要参数');
      }
      
      const message = await strapi.db.query('api::internal-message.internal-message').create({
        data: {
          user: userId,
          title,
          content,
          type,
          priority,
          isRead: false,
          publishedAt: new Date()
        }
      });
      
      // 发送推送通知
      await sendPushNotification(strapi, userId, title, content);
      
      ctx.send({
        success: true,
        data: message,
        message: '消息发送成功'
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      ctx.throw(500, '发送消息失败');
    }
  },

  /**
   * 批量发送消息
   */
  async sendBatchMessage(ctx) {
    try {
      const { userIds, title, content, type = 'system', priority = 'normal' } = ctx.request.body;
      
      if (!userIds || !Array.isArray(userIds) || !title || !content) {
        return ctx.badRequest('缺少必要参数');
      }
      
      const messages = [];
      
      for (const userId of userIds) {
        const message = await strapi.db.query('api::internal-message.internal-message').create({
          data: {
            user: userId,
            title,
            content,
            type,
            priority,
            isRead: false,
            publishedAt: new Date()
          }
        });
        
        messages.push(message);
        
        // 发送推送通知
        await sendPushNotification(strapi, userId, title, content);
      }
      
      ctx.send({
        success: true,
        data: messages,
        message: `成功发送 ${messages.length} 条消息`
      });
    } catch (error) {
      console.error('批量发送消息失败:', error);
      ctx.throw(500, '批量发送消息失败');
    }
  },

  /**
   * 获取用户消息列表
   */
  async getUserMessages(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 20, type = '', isRead = '' } = ctx.query;
      
      const filters: any = {
        user: userId
      };
      
      if (type) {
        filters.type = type;
      }
      
      if (isRead !== '') {
        filters.isRead = isRead === 'true';
      }
      
      const messages = await strapi.db.query('api::internal-message.internal-message').findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
        limit: parseInt(pageSize as string),
        offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
        populate: ['user']
      });
      
      // 获取未读消息数量
      const unreadCount = await strapi.db.query('api::internal-message.internal-message').count({
        where: {
          user: userId,
          isRead: false
        }
      });
      
      ctx.send({
        success: true,
        data: {
          messages,
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            total: messages.length
          },
          unreadCount
        }
      });
    } catch (error) {
      console.error('获取用户消息失败:', error);
      ctx.throw(500, '获取用户消息失败');
    }
  },

  /**
   * 标记消息为已读
   */
  async markAsRead(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;
      
      const message = await strapi.db.query('api::internal-message.internal-message').findOne({
        where: { id },
        populate: ['user']
      });
      
      if (!message) {
        return ctx.notFound('消息不存在');
      }
      
      if (message.user.id !== userId) {
        return ctx.forbidden('无权操作此消息');
      }
      
      const updatedMessage = await strapi.db.query('api::internal-message.internal-message').update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
      
      ctx.send({
        success: true,
        data: updatedMessage,
        message: '消息已标记为已读'
      });
    } catch (error) {
      console.error('标记消息已读失败:', error);
      ctx.throw(500, '标记消息已读失败');
    }
  },

  /**
   * 批量标记消息为已读
   */
  async markBatchAsRead(ctx) {
    try {
      const { messageIds } = ctx.request.body;
      const userId = ctx.state.user.id;
      
      if (!messageIds || !Array.isArray(messageIds)) {
        return ctx.badRequest('缺少消息ID列表');
      }
      
      let updatedCount = 0;
      
      for (const messageId of messageIds) {
        const message = await strapi.db.query('api::internal-message.internal-message').findOne({
          where: { id: messageId },
          populate: ['user']
        });
        
        if (message && message.user.id === userId) {
          await strapi.db.query('api::internal-message.internal-message').update({
            where: { id: messageId },
            data: {
              isRead: true,
              readAt: new Date()
            }
          });
          updatedCount++;
        }
      }
      
      ctx.send({
        success: true,
        data: { updatedCount },
        message: `成功标记 ${updatedCount} 条消息为已读`
      });
    } catch (error) {
      console.error('批量标记消息已读失败:', error);
      ctx.throw(500, '批量标记消息已读失败');
    }
  },

  /**
   * 删除消息
   */
  async deleteMessage(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;
      
      const message = await strapi.db.query('api::internal-message.internal-message').findOne({
        where: { id },
        populate: ['user']
      });
      
      if (!message) {
        return ctx.notFound('消息不存在');
      }
      
      if (message.user.id !== userId) {
        return ctx.forbidden('无权删除此消息');
      }
      
      await strapi.db.query('api::internal-message.internal-message').delete({
        where: { id }
      });
      
      ctx.send({
        success: true,
        message: '消息删除成功'
      });
    } catch (error) {
      console.error('删除消息失败:', error);
      ctx.throw(500, '删除消息失败');
    }
  },

  /**
   * 获取消息统计
   */
  async getMessageStats(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      const totalMessages = await strapi.db.query('api::internal-message.internal-message').count({
        where: { user: userId }
      });
      
      const unreadMessages = await strapi.db.query('api::internal-message.internal-message').count({
        where: {
          user: userId,
          isRead: false
        }
      });
      
      const systemMessages = await strapi.db.query('api::internal-message.internal-message').count({
        where: {
          user: userId,
          type: 'system'
        }
      });
      
      const notificationMessages = await strapi.db.query('api::internal-message.internal-message').count({
        where: {
          user: userId,
          type: 'notification'
        }
      });
      
      ctx.send({
        success: true,
        data: {
          totalMessages,
          unreadMessages,
          systemMessages,
          notificationMessages,
          readRate: totalMessages > 0 ? (((totalMessages - unreadMessages) / totalMessages) * 100).toFixed(2) : '0'
        }
      });
    } catch (error) {
      console.error('获取消息统计失败:', error);
      ctx.throw(500, '获取消息统计失败');
    }
  }
})); 