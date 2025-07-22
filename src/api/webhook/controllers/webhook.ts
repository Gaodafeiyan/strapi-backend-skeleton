import { factories } from '@strapi/strapi';

export default ({ strapi }) => ({
  // Webhook统一处理转入/转出txHash
  async handleTransaction(ctx) {
    const { txHash, status, type } = ctx.request.body;
    
    if (!txHash || !status || !type) {
      return ctx.badRequest('缺少必要参数: txHash, status, type');
    }

    try {
      // 幂等性检查 - 使用txHash作为唯一标识
      const existingRecharge = await strapi.entityService.findMany('api::qianbao-chongzhi.qianbao-chongzhi', {
        filters: { txHash, zhuangtai: 'success' }
      });

      const existingWithdrawal = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
        filters: { txHash, zhuangtai: 'success' }
      });

      if (existingRecharge.length > 0 || existingWithdrawal.length > 0) {
        return ctx.badRequest('该交易已处理，避免重复操作');
      }

      if (type === 'recharge') {
        await this.handleRechargeConfirmation(txHash, status);
      } else if (type === 'withdrawal') {
        await this.handleWithdrawalConfirmation(txHash, status);
      } else {
        return ctx.badRequest('无效的交易类型');
      }

      ctx.body = { 
        success: true, 
        message: `${type} 交易处理成功`,
        txHash 
      };
    } catch (error) {
      ctx.throw(500, `处理交易失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 处理充值确认
  async handleRechargeConfirmation(txHash: string, status: string) {
    const recharges = await strapi.entityService.findMany('api::qianbao-chongzhi.qianbao-chongzhi', {
      filters: { txHash, zhuangtai: 'pending' },
      populate: ['yonghu']
    });

    if (recharges.length === 0) {
      throw new Error('未找到待确认的充值记录');
    }

    const recharge = recharges[0] as any;

    if (status === 'success') {
      // 更新状态为成功
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', recharge.id, {
        data: { zhuangtai: 'success' }
      });

      // 增加用户余额
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        recharge.yonghu.id, 
        recharge.usdtJine.toString()
      );

      console.log(`充值确认成功: txHash=${txHash}, 用户=${recharge.yonghu.id}, 金额=${recharge.usdtJine}`);
    } else if (status === 'failed') {
      // 更新状态为失败
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', recharge.id, {
        data: { zhuangtai: 'failed' }
      });

      console.log(`充值失败: txHash=${txHash}, 用户=${recharge.yonghu.id}`);
    }
  },

  // 处理提现确认
  async handleWithdrawalConfirmation(txHash: string, status: string) {
    const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
      filters: { txHash, zhuangtai: 'broadcasted' },
      populate: ['yonghu']
    });

    if (withdrawals.length === 0) {
      throw new Error('未找到待确认的提现记录');
    }

    const withdrawal = withdrawals[0] as any;

    if (status === 'success') {
      // 更新状态为成功
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawal.id, {
        data: { zhuangtai: 'success' }
      });

      console.log(`提现确认成功: txHash=${txHash}, 用户=${withdrawal.yonghu.id}, 金额=${withdrawal.usdtJine}`);
    } else if (status === 'failed') {
      // 更新状态为失败并返还余额
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawal.id, {
        data: { zhuangtai: 'failed' }
      });

      // 返还用户余额
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        withdrawal.yonghu.id, 
        withdrawal.usdtJine.toString()
      );

      console.log(`提现失败，已返还余额: txHash=${txHash}, 用户=${withdrawal.yonghu.id}, 金额=${withdrawal.usdtJine}`);
    }
  }
}); 