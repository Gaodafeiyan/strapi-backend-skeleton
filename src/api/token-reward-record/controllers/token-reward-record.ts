import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::token-reward-record.token-reward-record', ({ strapi }) => ({
  // 获取用户代币奖励记录
  async getUserTokenRewards(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 20 } = ctx.query;

      const records = await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
        filters: { user: userId },
        populate: ['token'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: records,
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize)),
          total: records.length
        }
      };
    } catch (error) {
      console.error('获取代币奖励记录失败:', error);
      ctx.throw(500, `获取代币奖励记录失败: ${error.message}`);
    }
  },

  // 赠送代币奖励
  async giveTokenReward(ctx) {
    try {
      const { userId, tokenId, amount, reason, type = 'manual' } = ctx.request.body;

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
          reason: reason || '代币奖励',
          type: type,
          status: 'pending'
        }
      });

      // 更新用户钱包中的代币余额
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
      const currentBalances = JSON.parse(wallet.aiTokenBalances || '{}');
      const currentBalance = parseFloat(currentBalances[tokenId] || '0');
      const newBalance = currentBalance + parseFloat(amount);
      currentBalances[tokenId] = newBalance.toString();

      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: {
          aiTokenBalances: JSON.stringify(currentBalances)
        }
      });

      // 更新奖励记录状态
      await strapi.entityService.update('api::token-reward-record.token-reward-record', rewardRecord.id, {
        data: {
          status: 'finished',
          processed_at: new Date()
        }
      });

      ctx.body = {
        success: true,
        data: {
          recordId: rewardRecord.id,
          userId,
          tokenId,
          amount,
          newBalance: newBalance.toString(),
          reason
        },
        message: '代币奖励发放成功'
      };
    } catch (error) {
      console.error('赠送代币奖励失败:', error);
      ctx.throw(500, `赠送代币奖励失败: ${error.message}`);
    }
  },

  // 获取代币奖励统计
  async getTokenRewardStats(ctx) {
    try {
      const userId = ctx.state.user.id;

      const records = await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
        filters: { user: userId },
        populate: ['token']
      });

      // 按代币分组统计
      const statsByToken = {};
      let totalRewards = 0;

      records.forEach(record => {
        const tokenId = record.token.id;
        const amount = parseFloat(record.amount || '0');
        
        if (!statsByToken[tokenId]) {
          statsByToken[tokenId] = {
            tokenId,
            tokenName: record.token.name,
            tokenSymbol: record.token.symbol,
            totalAmount: 0,
            rewardCount: 0
          };
        }
        
        statsByToken[tokenId].totalAmount += amount;
        statsByToken[tokenId].rewardCount += 1;
        totalRewards += amount;
      });

      ctx.body = {
        success: true,
        data: {
          userId,
          totalRewards,
          totalRecords: records.length,
          statsByToken: Object.values(statsByToken)
        }
      };
    } catch (error) {
      console.error('获取代币奖励统计失败:', error);
      ctx.throw(500, `获取代币奖励统计失败: ${error.message}`);
    }
  },

  // 批量赠送代币奖励
  async batchGiveTokenRewards(ctx) {
    try {
      const { rewards } = ctx.request.body;

      if (!rewards || !Array.isArray(rewards)) {
        return ctx.badRequest('rewards参数必须是数组');
      }

      const results = [];
      for (const reward of rewards) {
        try {
          const { userId, tokenId, amount, reason, type = 'batch' } = reward;

          if (!userId || !tokenId || !amount) {
            results.push({
              userId,
              tokenId,
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
              tokenId,
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
              tokenId,
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
              reason: reason || '批量代币奖励',
              type: type,
              status: 'pending'
            }
          });

          // 更新用户钱包中的代币余额
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
          const currentBalances = JSON.parse(wallet.aiTokenBalances || '{}');
          const currentBalance = parseFloat(currentBalances[tokenId] || '0');
          const newBalance = currentBalance + parseFloat(amount);
          currentBalances[tokenId] = newBalance.toString();

          await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
            data: {
              aiTokenBalances: JSON.stringify(currentBalances)
            }
          });

          // 更新奖励记录状态
          await strapi.entityService.update('api::token-reward-record.token-reward-record', rewardRecord.id, {
            data: {
              status: 'finished',
              processed_at: new Date()
            }
          });

          results.push({
            userId,
            tokenId,
            success: true,
            recordId: rewardRecord.id,
            newBalance: newBalance.toString()
          });
        } catch (error) {
          results.push({
            userId: reward.userId,
            tokenId: reward.tokenId,
            success: false,
            error: error.message
          });
        }
      }

      ctx.body = {
        success: true,
        data: {
          total: rewards.length,
          successCount: results.filter(r => r.success).length,
          failCount: results.filter(r => !r.success).length,
          results
        },
        message: '批量赠送完成'
      };
    } catch (error) {
      console.error('批量赠送代币奖励失败:', error);
      ctx.throw(500, `批量赠送代币奖励失败: ${error.message}`);
    }
  },

  // 获取所有代币奖励记录（管理员）
  async getAllTokenRewards(ctx) {
    try {
      const { page = 1, pageSize = 50, userId, tokenId, status } = ctx.query;

      const filters = {};
      if (userId) filters.user = userId;
      if (tokenId) filters.token = tokenId;
      if (status) filters.status = status;

      const records = await strapi.entityService.findMany('api::token-reward-record.token-reward-record', {
        filters,
        populate: ['user', 'token'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: records,
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize)),
          total: records.length
        }
      };
    } catch (error) {
      console.error('获取所有代币奖励记录失败:', error);
      ctx.throw(500, `获取所有代币奖励记录失败: ${error.message}`);
    }
  }
})); 