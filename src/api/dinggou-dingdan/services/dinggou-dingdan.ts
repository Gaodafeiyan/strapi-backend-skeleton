import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';
import { getCurrentUTCTime, addDays, isExpired, getTimeDifferenceDescription } from '../../../utils/timezone';
import { executeWithLock } from '../../../utils/concurrency';
import { DatabaseRowLock } from '../../../utils/concurrency';

export default factories.createCoreService('api::dinggou-dingdan.dinggou-dingdan', ({ strapi }) => ({
  /** 创建投资订单 */
  async createOrder(userId: number, jihuaId: number) {
    // 使用分布式锁防止重复创建
    const lockKey = `createOrder:${userId}:${jihuaId}`;
    
    return await executeWithLock(lockKey, async () => {
      return await strapi.db.transaction(async (trx) => {
        // ① 验证投资计划
        const jihua = await trx.query('api::dinggou-jihua.dinggou-jihua').findOne({
          where: { id: jihuaId }
        });
        
        if (!jihua) {
          throw new Error('投资计划不存在');
        }
        
        if (!(jihua as any).kaiqi) {
          throw new Error('该投资计划已关闭');
        }

        const { amount, cycle_days } = jihua;

        // 验证用户是否存在
        const user = await trx.query('plugin::users-permissions.user').findOne({
          where: { id: userId }
        });
        
        if (!user) {
          throw new Error('用户不存在');
        }

        // ① 扣钱包本金（带锁）
        const wallet = await trx.query('api::qianbao-yue.qianbao-yue').findOne({
          where: { yonghu: userId },
          lock: true
        });

        if (!wallet) {
          throw new Error('用户钱包不存在');
        }

        const currentBalance = new Decimal(wallet.usdtYue || 0);
        const deductAmount = new Decimal(amount);
        
        if (currentBalance.lessThan(deductAmount)) {
          throw new Error('余额不足');
        }

        const newBalance = currentBalance.minus(deductAmount).toFixed(2);
        
        await trx.query('api::qianbao-yue.qianbao-yue').update({
          where: { id: wallet.id },
          data: { usdtYue: newBalance }
        });

        // ② 写订单 - 使用UTC时间
        const startTime = getCurrentUTCTime();
        const endTime = addDays(startTime, cycle_days);
        
        const order = await trx.query('api::dinggou-dingdan.dinggou-dingdan').create({
          data: {
            amount,
            start_at: startTime,
            end_at: endTime,
            principal: amount,
            yield_rate: jihua.yield_rate,
            cycle_days: cycle_days,
            yonghu: userId,
            jihua: jihuaId,
            status: 'pending',
            version: 1 // 添加版本号用于乐观锁
          },
        });

        return order;
      });
    });
  },

  /** 到期赎回 */
  async redeem(orderId: number, options: { force?: boolean; testMode?: boolean } = {}) {
    const { force = false, testMode = false } = options;
    
    // 使用分布式锁防止重复赎回
    const lockKey = `redeemOrder:${orderId}`;
    
    return await executeWithLock(lockKey, async () => {
      const order = await strapi.entityService.findOne(
        'api::dinggou-dingdan.dinggou-dingdan',
        orderId,
        { 
          populate: {
            jihua: true,
            yonghu: {
              populate: ['shangji']
            }
          }
        }
      ) as any;
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      // 允许 pending 和 running 状态赎回
      if (order.status !== 'pending' && order.status !== 'running') {
        throw new Error('订单状态不允许赎回');
      }
      
      // 使用UTC时间处理
      const now = getCurrentUTCTime();
      const startTime = new Date(order.start_at);
      const endTime = new Date(order.end_at);
      const isOrderExpired = isExpired(endTime);
      
      // 如果订单状态是 running 但已过期，自动标记为 finished
      if (order.status === 'running' && isOrderExpired && !force && !testMode) {
        await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
          data: { status: 'finished' } as any
        });
        throw new Error('订单已到期，请重新点击赎回');
      }
      
      // 如果订单未到期且不是强制赎回，则不允许赎回
      if (!isOrderExpired && !force && !testMode) {
        const timeMessage = getTimeDifferenceDescription(now, endTime);
        throw new Error(`订单尚未到期，${timeMessage}`);
      }

      const jihua = order.jihua;
      if (!jihua) {
        throw new Error('关联的投资计划不存在');
      }

      // 计算收益
      let staticUSDT, aiQty;
      
      if (isOrderExpired || force || testMode) {
        // 正常到期或强制赎回：按计划比例计算
        staticUSDT = new Decimal(order.amount).mul((jihua as any).jingtaiBili).div(100).toFixed(2);
        aiQty = new Decimal(order.amount).mul((jihua as any).aiBili).div(100).toFixed(8);
      } else {
        // 未到期赎回：按实际时间比例计算
        const totalMs = endTime.getTime() - startTime.getTime();
        const actualMs = now.getTime() - startTime.getTime();
        const ratio = Math.max(0, actualMs / totalMs);
        
        staticUSDT = new Decimal(order.amount).mul((jihua as any).jingtaiBili).div(100).mul(ratio).toFixed(2);
        aiQty = new Decimal(order.amount).mul((jihua as any).aiBili).div(100).mul(ratio).toFixed(8);
      }

      // AI代币相关变量
      let selectedToken = null;
      let aiTokenAmount = '0';
      let aiUsdtValue = '0';
      let tokenPrice = 0;

      try {
        // 使用数据库行锁确保钱包操作的原子性
        return await DatabaseRowLock.executeWithRowLock(
          strapi,
          'api::qianbao-yue.qianbao-yue',
          order.yonghu.id,
          async (trx) => {
            // ① 随机选择AI代币并获取价格
            try {
              selectedToken = await strapi.service('api::ai-token.ai-token').selectRandomToken();
              tokenPrice = await strapi.service('api::ai-token.ai-token').getTokenPrice(selectedToken.id);
              
              // 计算AI代币数量和USDT价值
              aiUsdtValue = new Decimal(order.amount).mul((jihua as any).aiBili).div(100).toFixed(2);
              aiTokenAmount = new Decimal(aiUsdtValue).div(tokenPrice).toFixed(8);
            } catch (tokenError) {
              console.error('AI代币处理失败:', tokenError);
              // AI代币失败不影响主流程，使用默认值
              selectedToken = null;
              aiTokenAmount = '0';
              aiUsdtValue = '0';
              tokenPrice = 0;
            }

            // ② 钱包加钱
            const wallet = await trx.query('api::qianbao-yue.qianbao-yue').findOne({
              where: { yonghu: order.yonghu.id },
              lock: true
            });

            if (!wallet) {
              throw new Error('用户钱包不存在');
            }

            const newUsdt = new Decimal(wallet.usdtYue || 0).plus(staticUSDT).toFixed(2);
            const newAi = new Decimal(wallet.aiYue || 0).plus(aiQty).toFixed(8);

            // 更新AI代币余额
            const currentTokenBalances = JSON.parse(wallet.aiTokenBalances || '{}');
            if (selectedToken) {
              const currentTokenBalance = new Decimal(currentTokenBalances[selectedToken.id] || 0);
              currentTokenBalances[selectedToken.id] = currentTokenBalance.plus(aiTokenAmount).toFixed(8);
            }

            // 更新钱包余额
            await trx.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                usdtYue: newUsdt,
                aiYue: newAi,
                aiTokenBalances: JSON.stringify(currentTokenBalances)
              }
            });

            // ③ 更新订单状态
            await trx.query('api::dinggou-dingdan.dinggou-dingdan').update({
              where: { id: orderId },
              data: {
                status: 'finished',
                redeemed_at: now,
                payout_amount: staticUSDT
              }
            });

            // ④ 创建代币奖励记录
            if (selectedToken && aiTokenAmount !== '0') {
              await trx.query('api::token-reward-record.token-reward-record').create({
                data: {
                  yonghu: order.yonghu.id,
                  token: selectedToken.id,
                  amount: aiTokenAmount,
                  usdt_value: aiUsdtValue,
                  source: 'investment_redeem',
                  order: orderId
                }
              });
            }

            // ⑤ 自动赠送抽奖次数（如果计划配置了抽奖次数）
            try {
              const lotteryChances = (jihua as any).lottery_chances || 0;
              const lotteryPrizeId = (jihua as any).lottery_prize_id;
              
              if (lotteryChances > 0 && lotteryPrizeId) {
                await strapi.service('api::choujiang-jihui.choujiang-jihui').giveChance({
                  userId: order.yonghu.id,
                  jiangpinId: lotteryPrizeId,  // 修正参数名
                  count: lotteryChances,
                  reason: `投资赎回奖励 - 计划: ${(jihua as any).jihuaCode || jihua.id}`,
                  type: 'investment_redeem'
                });
              }
            } catch (lotteryError) {
              console.error('抽奖次数赠送失败:', lotteryError);
              // 抽奖次数赠送失败不影响主流程
            }

            // ⑤ 自动触发推荐奖励（如果用户有推荐人）
            try {
              await strapi.service('api::yaoqing-jiangli.yaoqing-jiangli').createReferralReward({
                orderId: orderId,
                userId: order.yonghu.id,
                amount: staticUSDT,
                type: 'investment_complete'
              });
            } catch (referralError) {
              console.error('推荐奖励创建失败:', referralError);
              // 推荐奖励失败不影响主流程
            }

            return {
              success: true,
              staticUSDT,
              aiQty,
              selectedToken,
              aiTokenAmount,
              aiUsdtValue
            };
          }
        );
      } catch (error) {
        console.error('赎回失败:', error);
        throw error;
      }
    });
  }
})); 