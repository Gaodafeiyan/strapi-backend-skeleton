import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::qianbao-tixian.qianbao-tixian',
  ({ strapi }) => ({
    // 获取我的提现记录
    async getMyWithdrawals(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
          filters: { user: userId } as any,
          sort: { createdAt: 'desc' },
          populate: ['user'] as any
        });
        
        ctx.body = {
          data: withdrawals
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 获取提现详情
    async getWithdrawalDetails(ctx) {
      try {
        const { id } = ctx.params;
        const userId = ctx.state.user.id;
        
        const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', id, {
          populate: ['user'] as any
        });
        
        if (!withdrawal) {
          return ctx.notFound('提现记录不存在');
        }
        
        if ((withdrawal as any).user.id !== userId) {
          return ctx.forbidden('无权查看此提现记录');
        }
        
        ctx.body = {
          data: withdrawal
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 创建提现申请
    async createWithdrawal(ctx) {
      try {
        const { to_address, amount, user } = ctx.request.body;
        
        if (!to_address || !amount || !user) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证用户钱包余额
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: user } as any
        });
        
        const wallet = wallets[0];
        if (!wallet || parseFloat(wallet.usdtYue) < parseFloat(amount)) {
          return ctx.badRequest('余额不足');
        }

        // 创建提现记录
        const withdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
          data: {
            user,
            amount,
            status: 'pending'
          } as any
        });

        // 扣除钱包余额
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            usdtYue: (parseFloat(wallet.usdtYue) - parseFloat(amount)).toString()
          }
        });

        ctx.body = {
          success: true,
          data: withdrawal,
          message: '提现申请创建成功'
        };
      } catch (error) {
        console.error('创建提现申请失败:', error);
        ctx.throw(500, `创建提现申请失败: ${error.message}`);
      }
    },

    // 确认提现（管理员操作）
    async confirmWithdrawal(ctx) {
      try {
        const { id } = ctx.params;
        const { txHash, blockNumber } = ctx.request.body;
        
        const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', id);
        
        if (!withdrawal) {
          return ctx.notFound('提现记录不存在');
        }

        await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', id, {
          data: {
            status: 'completed',
            tx_hash: txHash,
            block_number: blockNumber,
            completed_at: new Date()
          } as any
        });

        ctx.body = {
          success: true,
          message: '提现确认成功'
        };
      } catch (error) {
        console.error('确认提现失败:', error);
        ctx.throw(500, `确认提现失败: ${error.message}`);
      }
    },

    // 处理提现失败
    async handleWithdrawFailure(ctx) {
      try {
        const { id } = ctx.params;
        
        const withdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', id);
        
        if (!withdrawal) {
          return ctx.notFound('提现记录不存在');
        }

        // 更新提现状态
        await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', id, {
          data: {
            status: 'failed'
          } as any
        });

        // 退还用户余额
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: (withdrawal as any).user.id } as any
        });
        
        if (wallets.length > 0) {
          const wallet = wallets[0];
          await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
            data: {
              usdtYue: (parseFloat(wallet.usdtYue) + parseFloat((withdrawal as any).amount)).toString()
            }
          });
        }

        ctx.body = {
          success: true,
          message: '提现失败处理完成，余额已退还'
        };
      } catch (error) {
        console.error('处理提现失败:', error);
        ctx.throw(500, `处理提现失败: ${error.message}`);
      }
    }
  })
); 