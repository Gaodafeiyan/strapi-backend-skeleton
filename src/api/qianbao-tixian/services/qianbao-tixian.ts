import { factories } from '@strapi/strapi';
import { addWithdrawSignJob, WithdrawJobData } from '../../../queues/withdraw';

export default factories.createCoreService(
  'api::qianbao-tixian.qianbao-tixian' as any,
  ({ strapi }) => ({
    // 请求提现 - 集成队列系统
    async requestWithdraw(userId: number, amount: string | number, toAddress: string) {
      return strapi.db.transaction(async (trx) => {
        try {
          // 确保amount是string类型
          const amountStr = amount.toString();
          
          // 1. 扣除用户余额
          await strapi.service('api::qianbao-yue.qianbao-yue').deductBalance(userId, amountStr);

          // 2. 创建提现记录
          const withdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian' as any, {
            data: {
              yonghu: userId,
              usdtJine: amountStr,  // 使用string类型
              toAddress,
              zhuangtai: 'pending',
            },
            transaction: trx,
          });

          // 3. 添加签名任务到队列
          const jobData: WithdrawJobData = {
            withdrawId: Number(withdrawal.id),
            userId,
            amount: amountStr,  // 使用string类型
            toAddress,
            priority: 'normal',
          };

          await addWithdrawSignJob(jobData);

          console.log(`📋 提现请求已创建: ID=${withdrawal.id}, 用户=${userId}, 金额=${amountStr}, 地址=${toAddress}`);

          return withdrawal;
        } catch (error) {
          console.error('❌ 提现请求失败:', error);
          throw error;
        }
      });
    },

    // 更新提现状态
    async updateWithdrawStatus(withdrawId: number, status: string, txHash?: string) {
      try {
        const updateData: any = { zhuangtai: status };
        if (txHash) {
          updateData.txHash = txHash;
        }

        const withdrawal = await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian' as any, withdrawId, {
          data: updateData,
        });

        console.log(`📝 提现状态已更新: ID=${withdrawId}, 状态=${status}, 交易哈希=${txHash || 'N/A'}`);

        return withdrawal;
      } catch (error) {
        console.error('❌ 更新提现状态失败:', error);
        throw error;
      }
    },

    // 处理提现失败 - 返还余额
    async handleWithdrawFailure(withdrawId: number) {
      return strapi.db.transaction(async (trx) => {
        try {
          const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian' as any, withdrawId, {
            populate: ['yonghu'],
            transaction: trx,
          });

          if (!withdrawal) {
            throw new Error('提现记录不存在');
          }

          // 更新状态为失败
          await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian' as any, withdrawId, {
            data: { zhuangtai: 'failed' },
            transaction: trx,
          });

          // 返还用户余额
          await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
            (withdrawal as any).yonghu.id,
            (withdrawal as any).usdtJine.toString()
          );

          console.log(`💰 提现失败，余额已返还: ID=${withdrawId}, 用户=${(withdrawal as any).yonghu.id}, 金额=${(withdrawal as any).usdtJine}`);

          return withdrawal;
        } catch (error) {
          console.error('❌ 处理提现失败时出错:', error);
          throw error;
        }
      });
    },

    // 获取用户提现记录
    async getUserWithdrawals(userId: number, limit: number = 20, offset: number = 0) {
      try {
        const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian' as any, {
          filters: { yonghu: userId },
          sort: { createdAt: 'desc' },
          pagination: { limit, start: offset },
          populate: ['yonghu'],
        });

        return withdrawals;
      } catch (error) {
        console.error('❌ 获取用户提现记录失败:', error);
        throw error;
      }
    },

    // 获取待处理的提现记录
    async getPendingWithdrawals() {
      try {
        const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian' as any, {
          filters: { zhuangtai: 'pending' },
          sort: { createdAt: 'asc' },
          populate: ['yonghu'],
        });

        return withdrawals;
      } catch (error) {
        console.error('❌ 获取待处理提现记录失败:', error);
        throw error;
      }
    },

    // 获取已广播的提现记录
    async getBroadcastedWithdrawals() {
      try {
        const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian' as any, {
          filters: { zhuangtai: 'broadcasted' },
          sort: { updatedAt: 'asc' },
          populate: ['yonghu'],
        });

        return withdrawals;
      } catch (error) {
        console.error('❌ 获取已广播提现记录失败:', error);
        throw error;
      }
    },
  })
); 