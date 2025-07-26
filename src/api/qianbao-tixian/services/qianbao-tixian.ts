import { factories } from '@strapi/strapi';
import { addWithdrawSignJob, WithdrawJobData } from '../../../queues/withdraw';

export default factories.createCoreService('api::qianbao-tixian.qianbao-tixian', ({ strapi }) => ({
  // 创建提现请求
  async requestWithdraw(userId: number, amount: string | number, toAddress: string) {
    try {
      const amountStr = amount.toString();
      console.log(`📋 创建提现请求: 用户=${userId}, 金额=${amountStr}, 地址=${toAddress}`);

      // 1. 扣除用户余额（deductBalance内部已经处理事务）
      await strapi.service('api::qianbao-yue.qianbao-yue').deductBalance(userId, amountStr);

      // 2. 创建提现记录
      const withdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
        data: {
          user: userId,
          amount: amountStr,  // 使用string类型
          to_address: toAddress,
          status: 'pending',
        } as any
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
  },

  // 更新提现状态
  async updateWithdrawStatus(withdrawId: number, status: string, txHash?: string) {
    try {
      const updateData: any = { status: status };
      if (txHash) {
        updateData.tx_hash = txHash;
      }

      const withdrawal = await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawId, {
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
    try {
      const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', withdrawId, {
        populate: ['yonghu']
      });

      if (!withdrawal) {
        throw new Error('提现记录不存在');
      }

      // 更新状态为失败
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawId, {
        data: { status: 'failed' } as any
      });

      // 返还用户余额（addBalance内部已经处理事务）
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        (withdrawal as any).user.id,
        (withdrawal as any).amount.toString()
      );

      console.log(`💰 提现失败，余额已返还: ID=${withdrawId}, 用户=${(withdrawal as any).user.id}, 金额=${(withdrawal as any).amount}`);

      return withdrawal;
    } catch (error) {
      console.error('❌ 处理提现失败时出错:', error);
      throw error;
    }
  },

  // 获取用户提现记录
  async getUserWithdrawals(userId: number, limit: number = 20, offset: number = 0) {
    try {
      const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
        filters: { user: userId } as any,
        sort: { createdAt: 'desc' },
        pagination: { limit, start: offset },
        populate: ['user'] as any,
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
      const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
        filters: { status: 'pending' } as any,
        sort: { createdAt: 'asc' },
        populate: ['user'] as any,
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
      const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
        filters: { status: 'processing' } as any,
        sort: { createdAt: 'asc' },
        populate: ['user'] as any,
      });

      return withdrawals;
    } catch (error) {
      console.error('❌ 获取已广播提现记录失败:', error);
      throw error;
    }
  },

  // 广播提现交易
  async broadcastWithdrawal(withdrawId: number) {
    try {
      const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', withdrawId, {
        populate: ['yonghu']
      });

      if (!withdrawal) {
        throw new Error('提现记录不存在');
      }

      // 更新状态为处理中
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawId, {
        data: { status: 'processing' } as any
      });

      console.log(`📡 提现已广播: ID=${withdrawId}, 用户=${(withdrawal as any).user.id}, 金额=${(withdrawal as any).amount}`);

      return withdrawal;
    } catch (error) {
      console.error('❌ 广播提现失败:', error);
      throw error;
    }
  },

  // 确认提现完成
  async confirmWithdrawal(withdrawId: number, txHash: string, blockNumber?: number) {
    try {
      const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', withdrawId);

      if (!withdrawal) {
        throw new Error('提现记录不存在');
      }

      // 更新状态为完成
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawId, {
        data: { 
          status: 'completed',
          tx_hash: txHash,
          block_number: blockNumber,
          completed_at: new Date()
        } as any
      });

      console.log(`✅ 提现已确认: ID=${withdrawId}, 交易哈希=${txHash}`);

      return withdrawal;
    } catch (error) {
      console.error('❌ 确认提现失败:', error);
      throw error;
    }
  }
})); 