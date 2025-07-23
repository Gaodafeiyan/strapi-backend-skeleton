import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::dinggou-dingdan.dinggou-dingdan',
  ({ strapi }) => ({
    /** 创建订单并锁定本金 */
    async createOrder(userId: number, jihuaId: number) {
      // 使用事务确保数据一致性
      return await strapi.db.transaction(async (trx) => {
        // 验证计划是否存在且开启
        const jihua = await trx.query('api::dinggou-jihua.dinggou-jihua').findOne({
          where: { id: jihuaId }
        });
        
        if (!jihua) {
          throw new Error('投资计划不存在');
        }
        
        if (!jihua.kaiqi) {
          throw new Error('该投资计划已关闭');
        }

        const { benjinUSDT, zhouQiTian } = jihua;

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
        const deductAmount = new Decimal(benjinUSDT);
        
        if (currentBalance.lessThan(deductAmount)) {
          throw new Error('余额不足');
        }

        const newBalance = currentBalance.minus(deductAmount).toFixed(2);
        
        await trx.query('api::qianbao-yue.qianbao-yue').update({
          where: { id: wallet.id },
          data: { usdtYue: newBalance }
        });

        // ② 写订单
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + zhouQiTian);
        
        const order = await trx.query('api::dinggou-dingdan.dinggou-dingdan').create({
          data: {
            benjinUSDT,
            kaishiShiJian: new Date(),
            jieshuShiJian: endDate,
            yonghu: userId,
            jihua: jihuaId,
          },
        });

        return order;
      });
    },

    /** 到期赎回 */
    async redeem(orderId: number, options: { force?: boolean; testMode?: boolean } = {}) {
      const { force = false, testMode = false } = options;
      
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
      
      // 允许 active 和 redeemable 状态赎回
      if (order.zhuangtai !== 'active' && order.zhuangtai !== 'redeemable') {
        throw new Error('订单状态不允许赎回');
      }
      
      const now = new Date();
      // 确保时间字段是Date对象
      const startTime = new Date(order.kaishiShiJian);
      const endTime = new Date(order.jieshuShiJian);
      const isExpired = now >= endTime;
      
      // 如果订单状态是 active 但已过期，自动标记为 redeemable
      if (order.zhuangtai === 'active' && isExpired && !force && !testMode) {
        await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
          data: { zhuangtai: 'redeemable' }
        });
        throw new Error('订单已到期，请重新点击赎回');
      }
      
      // 如果订单未到期且不是强制赎回，则不允许赎回
      if (!isExpired && !force && !testMode) {
        const remainingMs = endTime.getTime() - now.getTime();
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
        
        let timeMessage = '';
        if (remainingDays > 0) {
          timeMessage = `还需等待 ${remainingDays} 天`;
        } else if (remainingHours > 0) {
          timeMessage = `还需等待 ${remainingHours} 小时`;
        } else if (remainingMinutes > 0) {
          timeMessage = `还需等待 ${remainingMinutes} 分钟`;
        } else {
          timeMessage = '即将到期';
        }
        
        throw new Error(`订单尚未到期，${timeMessage}`);
      }

      const jihua = order.jihua;
      if (!jihua) {
        throw new Error('关联的投资计划不存在');
      }

      // 计算收益
      let staticUSDT, aiQty;
      
      if (isExpired || force || testMode) {
        // 正常到期或强制赎回：按计划比例计算
        staticUSDT = new Decimal(order.benjinUSDT).mul(jihua.jingtaiBili).div(100).toFixed(2);
        aiQty = new Decimal(order.benjinUSDT).mul(jihua.aiBili).div(100).toFixed(8);
      } else {
        // 未到期赎回：按实际时间比例计算
        const totalMs = endTime.getTime() - startTime.getTime();
        const actualMs = now.getTime() - startTime.getTime();
        const ratio = Math.max(0, actualMs / totalMs);
        
        staticUSDT = new Decimal(order.benjinUSDT).mul(jihua.jingtaiBili).div(100).mul(ratio).toFixed(2);
        aiQty = new Decimal(order.benjinUSDT).mul(jihua.aiBili).div(100).mul(ratio).toFixed(8);
      }

      // AI代币相关变量
      let selectedToken = null;
      let aiTokenAmount = '0';
      let aiUsdtValue = '0';
      let tokenPrice = 0;

      try {
        // 使用事务确保所有操作的原子性
        return await strapi.db.transaction(async (trx) => {
          // ① 随机选择AI代币并获取价格
          try {
            selectedToken = await strapi.service('api::ai-token.ai-token').selectRandomToken();
            tokenPrice = await strapi.service('api::ai-token.ai-token').getTokenPrice(selectedToken.id);
            
            // 计算AI代币数量和USDT价值
            aiUsdtValue = new Decimal(order.benjinUSDT).mul(jihua.aiBili).div(100).toFixed(2);
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
          let newTokenBalances = currentTokenBalances;
          
          if (selectedToken && aiTokenAmount !== '0') {
            const currentTokenBalance = new Decimal(currentTokenBalances[selectedToken.id] || 0);
            const newTokenBalance = currentTokenBalance.plus(aiTokenAmount).toFixed(8);
            newTokenBalances = {
              ...currentTokenBalances,
              [selectedToken.id]: newTokenBalance
            };
          }

          await trx.query('api::qianbao-yue.qianbao-yue').update({
            where: { id: wallet.id },
            data: { 
              usdtYue: newUsdt, 
              aiYue: newAi,
              aiTokenBalances: JSON.stringify(newTokenBalances)
            }
          });

          // ② 计算邀请奖励（仅到期时）
          if (isExpired || force) {
            try {
              console.log('开始创建邀请奖励，订单ID:', orderId);
              await strapi
                .service('api::yaoqing-jiangli.yaoqing-jiangli')
                .createReferralReward(order);
              console.log('邀请奖励创建成功');
            } catch (rewardError) {
              console.error('邀请奖励创建失败:', rewardError);
              // 邀请奖励失败不影响主流程
            }
          }

          // ③ 创建抽奖机会（仅到期时）
          if ((isExpired || force) && jihua.choujiangCi > 0) {
            try {
              console.log('开始创建抽奖机会，订单ID:', orderId, '抽奖次数:', jihua.choujiangCi);
              await strapi
                .service('api::choujiang-jihui.choujiang-jihui')
                .createChoujiangJihui(order.yonghu.id, orderId, jihua.choujiangCi);
              console.log('抽奖机会创建成功');
            } catch (choujiangError) {
              console.error('抽奖机会创建失败:', choujiangError);
              // 抽奖机会失败不影响主流程
            }
          }

          // ④ 创建代币赠送记录
          if (selectedToken && aiTokenAmount !== '0') {
            try {
              await strapi.service('api::token-reward-record.token-reward-record').createTokenReward(
                order.yonghu.id,
                orderId,
                selectedToken.id,
                aiTokenAmount,
                aiUsdtValue,
                tokenPrice.toFixed(8)
              );
            } catch (recordError) {
              console.error('创建代币赠送记录失败:', recordError);
              // 记录失败不影响主流程
            }
          }

          // ⑤ 更新订单
          await trx.query('api::dinggou-dingdan.dinggou-dingdan').update({
            where: { id: orderId },
            data: {
              zhuangtai: 'finished',
              jingtaiShouyi: staticUSDT,
              aiShuliang: aiQty,
            },
          });

          return {
            success: true,
            data: {
              orderId,
              benjinUSDT: order.benjinUSDT,
              staticUSDT,
              aiQty,
              selectedToken: selectedToken ? {
                id: selectedToken.id,
                name: selectedToken.name,
                symbol: selectedToken.symbol,
                amount: aiTokenAmount,
                usdtValue: aiUsdtValue,
                price: tokenPrice.toFixed(8)
              } : null,
              isExpired,
              force,
              testMode,
              startTime: startTime,
              endTime: endTime,
              currentTime: now
            }
          };
        });
      } catch (error) {
        throw new Error(`赎回失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },
  })
); 