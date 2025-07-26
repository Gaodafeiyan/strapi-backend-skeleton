export default {
  cron: '0 */6 * * *', // 每6小时执行一次
  async handler({ strapi }) {
    try {
      console.log('🕐 开始执行提现超时检查...');

      // 查找所有超过24小时的待处理提现
      const timeoutDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const overdueWithdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
        filters: {
          status: 'pending',
          createdAt: {
            $lt: timeoutDate
          }
        } as any,
        populate: ['user']
      });

      console.log(`📊 找到 ${overdueWithdrawals.length} 个超时提现`);

      for (const withdrawal of overdueWithdrawals) {
        try {
          console.log(`⏰ 处理超时提现: ID=${withdrawal.id}, 用户=${(withdrawal as any).user?.id}, 金额=${withdrawal.amount}`);

          // 更新提现状态为失败
          await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawal.id, {
            data: {
              status: 'failed'
            } as any
          });

          // 退还用户余额
          const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
            filters: { user: (withdrawal as any).user?.id } as any
          });
          
          if (wallets.length > 0) {
            const wallet = wallets[0];
            const currentBalance = parseFloat(wallet.usdtYue || '0');
            const refundAmount = parseFloat(withdrawal.amount);
            const newBalance = currentBalance + refundAmount;

            await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
              data: {
                usdtYue: newBalance.toString()
              }
            });

            console.log(`💰 已退还余额: 用户=${(withdrawal as any).user?.id}, 金额=${refundAmount}, 新余额=${newBalance}`);
          }

          // 发送通知给用户
          try {
            await strapi.service('api::notification.notification').sendInAppMessage(
              (withdrawal as any).user?.id,
              '提现超时',
              `您的提现申请已超时，金额 ${withdrawal.amount} USDT 已退还到您的钱包`,
              'warning'
            );
          } catch (notifyError) {
            console.error('发送通知失败:', notifyError);
          }

        } catch (error) {
          console.error(`❌ 处理超时提现失败: ID=${withdrawal.id}`, error);
        }
      }

      console.log('✅ 提现超时检查完成');
    } catch (error) {
      console.error('❌ 提现超时检查失败:', error);
    }
  }
}; 