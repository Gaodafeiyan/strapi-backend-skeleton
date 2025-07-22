import { factories } from '@strapi/strapi';
import { getQueueStatus, cleanQueue, pauseQueue, resumeQueue } from '../../../queues/withdraw';

export default factories.createCoreController('api::queue.queue', ({ strapi }) => ({
  // 获取队列状态
  async getStatus(ctx) {
    try {
      const status = await getQueueStatus();
      ctx.body = { 
        success: true, 
        data: status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `获取队列状态失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 清理队列
  async clean(ctx) {
    try {
      await cleanQueue();
      ctx.body = { 
        success: true, 
        message: '队列清理完成',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `清理队列失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 暂停队列
  async pause(ctx) {
    try {
      await pauseQueue();
      ctx.body = { 
        success: true, 
        message: '队列已暂停',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `暂停队列失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 恢复队列
  async resume(ctx) {
    try {
      await resumeQueue();
      ctx.body = { 
        success: true, 
        message: '队列已恢复',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `恢复队列失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 获取队列详细信息
  async getDetails(ctx) {
    try {
      const status = await getQueueStatus();
      const pendingWithdrawals = await strapi.service('api::qianbao-tixian.qianbao-tixian').getPendingWithdrawals();
      const broadcastedWithdrawals = await strapi.service('api::qianbao-tixian.qianbao-tixian').getBroadcastedWithdrawals();

      ctx.body = { 
        success: true, 
        data: {
          queueStatus: status,
          pendingWithdrawals: pendingWithdrawals.length,
          broadcastedWithdrawals: broadcastedWithdrawals.length,
          systemInfo: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `获取队列详细信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
})); 