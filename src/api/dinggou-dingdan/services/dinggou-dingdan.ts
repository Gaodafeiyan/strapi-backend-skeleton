import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';
import { getCurrentUTCTime, addDays, isExpired, getTimeDifferenceDescription } from '../../../utils/timezone';
import { executeWithLock } from '../../../utils/concurrency';
import { DatabaseRowLock } from '../../../utils/concurrency';

export default factories.createCoreService(
  'api::dinggou-dingdan.dinggou-dingdan',
  ({ strapi }) => ({
    // 创建投资订单
    async createOrder(userId: number, jihuaId: number, amount: string) {
      try {
        // 验证计划是否存在且开启
        const jihua = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', jihuaId);
        if (!jihua || !(jihua as any).kaiqi) {
          throw new Error('投资计划不存在或未开启');
        }

        // 验证用户钱包余额
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
        });
        
        const wallet = wallets[0];
        if (!wallet || parseFloat(wallet.usdtYue) < parseFloat(amount)) {
          throw new Error('余额不足');
        }

        // 计算投资周期和收益
        const { zhouQiTian } = jihua;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + zhouQiTian * 24 * 60 * 60 * 1000);

        // 创建订单
        const order = await strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
          data: {
            amount: amount,
            principal: amount,
            yield_rate: (jihua as any).jingtaiBili,
            cycle_days: zhouQiTian,
            start_at: startTime,
            end_at: endTime,
            user: userId,
            jihua: jihuaId,
            status: 'pending',
            version: 1
          } as any
        });

        // 扣除用户钱包余额
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            usdtYue: (parseFloat(wallet.usdtYue) - parseFloat(amount)).toString()
          }
        });

        return order;
      } catch (error) {
        console.error('创建投资订单失败:', error);
        throw error;
      }
    },

    // 赎回投资
    async redeemOrder(orderId: number) {
      try {
        const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
          populate: ['user', 'jihua']
        });

        if (!order) {
          throw new Error('订单不存在');
        }

        if ((order as any).status !== 'running') {
          throw new Error('订单状态不允许赎回');
        }

        // 计算收益
        const principal = parseFloat((order as any).principal);
        const yieldRate = parseFloat((order as any).yield_rate);
        const payoutAmount = principal * (1 + yieldRate / 100);

        // 更新订单状态
        await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
          data: {
            status: 'finished',
            redeemed_at: new Date(),
            payout_amount: payoutAmount.toString()
          } as any
        });

        // 返还用户钱包余额
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: (order as any).user.id } as any
        });
        
        if (wallets.length > 0) {
          const wallet = wallets[0];
          await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
            data: {
              usdtYue: (parseFloat(wallet.usdtYue) + payoutAmount).toString()
            }
          });
        }

        // ① 自动赠送AI代币（如果计划配置了AI代币奖励）
        try {
          const aiBili = (order as any).jihua.aiBili || 0;
          if (aiBili > 0) {
            // 这里需要根据实际AI代币ID来赠送
            // 暂时使用默认的AI代币ID为1
            await strapi.service('api::token-reward-record.token-reward-record').giveTokenRewardByUSDTValue({
              userId: (order as any).user.id,
              tokenId: 1, // 默认AI代币ID
              usdtValue: (payoutAmount * aiBili / 100).toString(),
              reason: `投资赎回奖励 - 计划: ${(order as any).jihua.name}`,
              type: 'investment_redeem'
            });
          }
        } catch (tokenError) {
          console.error('AI代币赠送失败:', tokenError);
          // AI代币赠送失败不影响主流程
        }

        // ② 自动触发推荐奖励
        try {
          await strapi.service('api::yaoqing-jiangli.yaoqing-jiangli').createReferralReward({
            userId: (order as any).user.id,
            orderId: orderId,
            amount: payoutAmount,
            type: 'investment_redeem'
          });
        } catch (referralError) {
          console.error('推荐奖励创建失败:', referralError);
          // 推荐奖励失败不影响主流程
        }

        // ③ 自动赠送抽奖次数（如果计划配置了抽奖次数）
        try {
          const lotteryChances = (order as any).jihua.lottery_chances || 0;
          const lotteryPrizeId = (order as any).jihua.lottery_prize_id;

          if (lotteryChances > 0 && lotteryPrizeId) {
            await strapi.service('api::choujiang-jihui.choujiang-jihui').giveChance({
              userId: (order as any).user.id,
              jiangpinId: lotteryPrizeId,
              count: lotteryChances,
              reason: `投资赎回奖励 - 计划: ${(order as any).jihua.jihuaCode || (order as any).jihua.id}`,
              type: 'investment_redeem'
            });
          }
        } catch (lotteryError) {
          console.error('抽奖次数赠送失败:', lotteryError);
          // 抽奖次数赠送失败不影响主流程
        }

        return {
          success: true,
          payoutAmount,
          message: '赎回成功'
        };
      } catch (error) {
        console.error('赎回投资失败:', error);
        throw error;
      }
    }
  })
); 