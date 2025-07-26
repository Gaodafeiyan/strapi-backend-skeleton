export default {
  // 每10分钟执行一次
  cron: '*/10 * * * *',
  
  async handler({ strapi }) {
    try {
      console.log('开始执行提现超时检查任务...');
      
      // 计算30分钟前的时间
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      // 查找broadcasted状态超过30分钟的提现记录
      const timeoutWithdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
        filters: {
          status: 'processing',
          updatedAt: {
            $lt: thirtyMinutesAgo
          }
        },
        populate: ['yonghu']
      });

      console.log(`找到 ${timeoutWithdrawals.length} 条超时提现记录`);

      let failedCount = 0;
      
      // 处理每条超时记录
      for (const withdrawal of timeoutWithdrawals) {
        try {
          // 更新状态为失败
          await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawal.id, {
            data: { status: 'failed' }
          });

          // 返还用户余额
          await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
            (withdrawal as any).yonghu.id, 
            (withdrawal as any).amount.toString()
          );

          failedCount++;
          console.log(`提现超时处理成功: ID=${withdrawal.id}, 用户=${(withdrawal as any).yonghu.id}, 金额=${(withdrawal as any).amount}`);
        } catch (error) {
          console.error(`处理超时提现失败: ID=${withdrawal.id}, 错误=${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      console.log(`提现超时检查任务完成: 成功处理 ${failedCount} 条记录`);
      
      // 返回处理结果
      return {
        success: true,
        totalFound: timeoutWithdrawals.length,
        processedCount: failedCount,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('提现超时检查任务执行失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      };
    }
  }
}; 