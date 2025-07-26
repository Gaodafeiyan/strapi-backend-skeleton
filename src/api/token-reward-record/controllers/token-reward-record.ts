import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController(
  'api::token-reward-record.token-reward-record',
  ({ strapi }) => ({
    // 获取我的奖励记录
    async getMyRewards(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const records = await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
          filters: { user: userId },
          sort: { createdAt: 'desc' },
          populate: ['token']
        });
        
        ctx.body = {
          data: records
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 赠送AI代币（基于数量）
    async giveTokenReward(ctx) {
      try {
        const { userId, tokenId, amount, reason, type = 'reward' } = ctx.request.body;
        
        if (!userId || !tokenId || !amount) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        if (!user) {
          return ctx.badRequest('用户不存在');
        }

        // 验证代币是否存在
        const token = await strapi.entityService.findOne('api::ai-token.ai-token', tokenId);
        if (!token) {
          return ctx.badRequest('代币不存在');
        }

        // 创建奖励记录
        const rewardRecord = await strapi.entityService.create('api::token-reward-record.token-reward-record', {
          data: {
            user: userId,
            token: tokenId,
            amount: amount.toString(),
            usdtValue: '0',
            tokenPrice: '0',
            createdAt: new Date()
          } as any
        });

        // 更新用户钱包中的代币余额
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
        });
        
        let wallet = wallets[0];
        if (!wallet) {
          // 如果钱包不存在，创建钱包
          wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
            data: {
              usdtYue: '0',
              aiYue: '0',
              aiTokenBalances: '{}',
              user: userId
            } as any
          });
        }

        // 更新代币余额
        const currentBalances = JSON.parse(String(wallet.aiTokenBalances || '{}'));
        const currentBalance = new Decimal(currentBalances[tokenId] || 0);
        const newBalance = currentBalance.plus(amount);
        currentBalances[tokenId] = newBalance.toString();

        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            aiTokenBalances: JSON.stringify(currentBalances)
          }
        });

        // 发送通知
        try {
          await strapi.service('api::notification.notification').sendInAppMessage(
            userId,
            '代币奖励到账',
            `您获得了 ${amount} ${token.symbol} 代币奖励`,
            'success'
          );
        } catch (notifyError) {
          console.error('发送通知失败:', notifyError);
        }

        ctx.body = {
          success: true,
          data: rewardRecord,
          message: '代币赠送成功'
        };
      } catch (error) {
        console.error('赠送代币失败:', error);
        ctx.throw(500, `赠送代币失败: ${error.message}`);
      }
    },

    // 基于USDT价值赠送AI代币（实时价格换算）
    async giveTokenRewardByUSDTValue(ctx) {
      try {
        const { userId, tokenId, usdtValue, reason, type = 'reward' } = ctx.request.body;
        
        if (!userId || !tokenId || !usdtValue) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        if (!user) {
          return ctx.badRequest('用户不存在');
        }

        // 验证代币是否存在
        const token = await strapi.entityService.findOne('api::ai-token.ai-token', tokenId);
        if (!token) {
          return ctx.badRequest('代币不存在');
        }

        // 获取代币实时价格
        let tokenPrice;
        try {
          tokenPrice = await strapi.service('api::ai-token.ai-token').getTokenPrice(parseInt(tokenId));
        } catch (priceError) {
          console.error('获取代币价格失败:', priceError);
          return ctx.badRequest('无法获取代币实时价格');
        }

        // 计算应赠送的代币数量
        const usdtValueDecimal = new Decimal(usdtValue);
        const priceDecimal = new Decimal(tokenPrice);
        const tokenAmount = usdtValueDecimal.div(priceDecimal);

        // 创建奖励记录
        const rewardRecord = await strapi.entityService.create('api::token-reward-record.token-reward-record', {
          data: {
            user: userId,
            token: tokenId,
            amount: tokenAmount.toFixed(8),
            usdtValue: usdtValue,
            tokenPrice: tokenPrice,
            reason: reason || 'USDT价值赠送',
            type: type,
            status: 'completed'
          } as any
        });

        // 更新用户钱包中的代币余额
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId }
        });
        
        let wallet = wallets[0];
        if (!wallet) {
          // 如果钱包不存在，创建钱包
          wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
            data: {
              usdtYue: '0',
              aiYue: '0',
              aiTokenBalances: '{}',
              user: userId
            }
          });
        }

        // 更新代币余额
        const currentBalances = JSON.parse(String(wallet.aiTokenBalances || '{}'));
        const currentBalance = new Decimal(currentBalances[tokenId] || 0);
        const newBalance = currentBalance.plus(tokenAmount);
        currentBalances[tokenId] = newBalance.toFixed(8);

        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            aiTokenBalances: JSON.stringify(currentBalances)
          }
        });

        // 发送通知
        try {
          await strapi.service('api::notification.notification').sendInAppMessage(
            userId,
            '代币奖励到账',
            `您获得了 ${tokenAmount.toFixed(6)} ${token.symbol} 代币奖励（价值 ${usdtValue} USDT）`,
            'success'
          );
        } catch (notifyError) {
          console.error('发送通知失败:', notifyError);
        }

        ctx.body = {
          success: true,
          data: {
            rewardRecord,
            tokenAmount: tokenAmount.toFixed(8),
            usdtValue,
            tokenPrice,
            tokenSymbol: token.symbol
          },
          message: '代币赠送成功'
        };
      } catch (error) {
        console.error('赠送代币失败:', error);
        ctx.throw(500, `赠送代币失败: ${error.message}`);
      }
    },

    // 批量基于USDT价值赠送AI代币
    async batchGiveTokenRewardByUSDTValue(ctx) {
      try {
        const { rewards } = ctx.request.body;
        
        if (!Array.isArray(rewards) || rewards.length === 0) {
          return ctx.badRequest('缺少奖励数据');
        }

        const results = [];
        
        for (const reward of rewards) {
          const { userId, tokenId, usdtValue, reason, type = 'reward' } = reward;
          
          try {
            // 验证参数
            if (!userId || !tokenId || !usdtValue) {
              results.push({
                userId,
                success: false,
                error: '缺少必要参数'
              });
              continue;
            }

            // 验证用户是否存在
            const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
            if (!user) {
              results.push({
                userId,
                success: false,
                error: '用户不存在'
              });
              continue;
            }

            // 验证代币是否存在
            const token = await strapi.entityService.findOne('api::ai-token.ai-token', tokenId);
            if (!token) {
              results.push({
                userId,
                success: false,
                error: '代币不存在'
              });
              continue;
            }

            // 获取代币实时价格
            let tokenPrice;
            try {
              tokenPrice = await strapi.service('api::ai-token.ai-token').getTokenPrice(parseInt(tokenId));
            } catch (priceError) {
              results.push({
                userId,
                success: false,
                error: '无法获取代币实时价格'
              });
              continue;
            }

            // 计算应赠送的代币数量
            const usdtValueDecimal = new Decimal(usdtValue);
            const priceDecimal = new Decimal(tokenPrice);
            const tokenAmount = usdtValueDecimal.div(priceDecimal);

            // 创建奖励记录
            const rewardRecord = await strapi.entityService.create('api::token-reward-record.token-reward-record', {
              data: {
                user: userId,
                token: tokenId,
                amount: tokenAmount.toFixed(8),
                usdtValue: usdtValue,
                tokenPrice: tokenPrice,
                reason: reason || '批量USDT价值赠送',
                type: type,
                status: 'completed'
              } as any
            });

            // 更新用户钱包
            const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
              filters: { user: userId }
            });
            
            let wallet = wallets[0];
            if (!wallet) {
              wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
                data: {
                  usdtYue: '0',
                  aiYue: '0',
                  aiTokenBalances: '{}',
                  user: userId
                }
              });
            }

            // 更新代币余额
            const currentBalances = JSON.parse(String(wallet.aiTokenBalances || '{}'));
            const currentBalance = new Decimal(currentBalances[tokenId] || 0);
            const newBalance = currentBalance.plus(tokenAmount);
            currentBalances[tokenId] = newBalance.toFixed(8);

            await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
              data: {
                aiTokenBalances: JSON.stringify(currentBalances)
              }
            });

            results.push({
              userId,
              success: true,
              rewardId: rewardRecord.id,
              tokenAmount: tokenAmount.toFixed(8),
              usdtValue,
              tokenPrice,
              message: '赠送成功'
            });

          } catch (error) {
            results.push({
              userId,
              success: false,
              error: error.message
            });
          }
        }

        ctx.body = {
          success: true,
          data: results,
          message: '批量赠送完成'
        };
      } catch (error) {
        console.error('批量赠送代币失败:', error);
        ctx.throw(500, `批量赠送代币失败: ${error.message}`);
      }
    },

    // 批量赠送代币
    async batchGiveTokenReward(ctx) {
      try {
        const { rewards } = ctx.request.body;
        
        if (!Array.isArray(rewards) || rewards.length === 0) {
          return ctx.badRequest('缺少奖励数据');
        }

        const results = [];
        
        for (const reward of rewards) {
          const { userId, tokenId, amount, reason, type = 'reward' } = reward;
          
          try {
            // 验证参数
            if (!userId || !tokenId || !amount) {
              results.push({
                userId,
                success: false,
                error: '缺少必要参数'
              });
              continue;
            }

            // 验证用户是否存在
            const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
            if (!user) {
              results.push({
                userId,
                success: false,
                error: '用户不存在'
              });
              continue;
            }

            // 验证代币是否存在
            const token = await strapi.entityService.findOne('api::ai-token.ai-token', tokenId);
            if (!token) {
              results.push({
                userId,
                success: false,
                error: '代币不存在'
              });
              continue;
            }

            // 创建奖励记录
            const rewardRecord = await strapi.entityService.create('api::token-reward-record.token-reward-record', {
              data: {
                user: userId,
                token: tokenId,
                amount: amount.toString(),
                reason: reason || '批量赠送',
                type: type,
                status: 'completed'
              } as any
            });

            // 更新用户钱包
            const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
              filters: { user: userId }
            });
            
            let wallet = wallets[0];
            if (!wallet) {
              wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
                data: {
                  usdtYue: '0',
                  aiYue: '0',
                  aiTokenBalances: '{}',
                  user: userId
                }
              });
            }

            // 更新代币余额
            const currentBalances = JSON.parse(String(wallet.aiTokenBalances || '{}'));
            const currentBalance = new Decimal(currentBalances[tokenId] || 0);
            const newBalance = currentBalance.plus(amount);
            currentBalances[tokenId] = newBalance.toString();

            await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
              data: {
                aiTokenBalances: JSON.stringify(currentBalances)
              }
            });

            results.push({
              userId,
              success: true,
              rewardId: rewardRecord.id,
              message: '赠送成功'
            });

          } catch (error) {
            results.push({
              userId,
              success: false,
              error: error.message
            });
          }
        }

        ctx.body = {
          success: true,
          data: results,
          message: '批量赠送完成'
        };
      } catch (error) {
        console.error('批量赠送代币失败:', error);
        ctx.throw(500, `批量赠送代币失败: ${error.message}`);
      }
    },

    // 获取奖励统计
    async getRewardStats(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const totalRewards = await strapi.entityService.count('api::token-reward-record.token-reward-record', {
          filters: { user: userId }
        });
        
        const totalAmount = await strapi.db.connection.raw(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM token_reward_records 
          WHERE user = ?
        `, [userId]);
        
        const typeStats = await strapi.db.connection.raw(`
          SELECT type, COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount
          FROM token_reward_records 
          WHERE user = ?
          GROUP BY type
        `, [userId]);
        
        ctx.body = {
          data: {
            totalRewards,
            totalAmount: totalAmount[0][0].total || 0,
            typeStats: typeStats[0] || []
          }
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    }
  })
); 