import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::dinggou-jihua.dinggou-jihua', ({ strapi }) => ({
  // 继承默认的CRUD操作

  // 获取活跃的投资计划
  async getActivePlans(ctx) {
    try {
      const plans = await strapi.entityService.findMany('api::dinggou-jihua.dinggou-jihua', {
        filters: { status: 'active' },
        sort: { createdAt: 'desc' }
      });
      
      ctx.body = { data: plans };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 创建投资计划
  async createPlan(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }

      const { name, amount, yield_rate, cycle_days, max_slots, description } = data;

      if (!name || !amount || !yield_rate || !cycle_days) {
        return ctx.badRequest('缺少必要字段');
      }

      const plan = await strapi.entityService.create('api::dinggou-jihua.dinggou-jihua', {
        data: {
          name,
          amount,
          yield_rate,
          cycle_days,
          max_slots: max_slots || 100,
          current_slots: 0,
          status: 'active',
          description: description || ''
        }
      });

      ctx.body = { data: plan };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 投资认购计划
  async invest(ctx) {
    try {
      const { planId } = ctx.params;
      const { investmentAmount } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!investmentAmount) {
        return ctx.badRequest('缺少投资金额');
      }

      // 验证投资计划
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('投资计划不存在');
      }

      if (plan.status !== 'active') {
        return ctx.badRequest('投资计划已关闭');
      }

      if (plan.current_slots >= plan.max_slots) {
        return ctx.badRequest('投资计划已满额');
      }

      // 验证用户钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { yonghu: userId }
      });
      
      let wallet = wallets[0];
      if (!wallet) {
        return ctx.badRequest('用户钱包不存在');
      }

      const walletBalance = new Decimal(wallet.usdtYue || 0);
      const investmentAmountDecimal = new Decimal(investmentAmount);
      
      if (walletBalance.lessThan(investmentAmountDecimal)) {
        return ctx.badRequest('钱包余额不足');
      }

      // 扣除钱包余额
      const newBalance = walletBalance.minus(investmentAmountDecimal);
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: {
          usdtYue: newBalance.toString()
        }
      });

      // 创建投资订单
      const order = await strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
        data: {
          jihua: planId,
          yonghu: userId,
          touziJinE: investmentAmount,
          zhuangtai: 'active',
          touziShiJian: new Date(),
          jieshuShiJian: new Date(Date.now() + plan.cycle_days * 24 * 60 * 60 * 1000),
          yuJiShouYi: new Decimal(investmentAmount).mul(plan.yield_rate).toString()
        }
      });

      // 更新计划当前投资人数
      await strapi.entityService.update('api::dinggou-jihua.dinggou-jihua', planId, {
        data: {
          current_slots: plan.current_slots + 1
        }
      });

      // 发送投资成功通知
      try {
        await strapi.service('api::notification.notification').notifyInvestmentSuccess(
          userId,
          order.id,
          investmentAmount
        );
      } catch (notifyError) {
        console.error('发送通知失败:', notifyError);
      }

      ctx.body = {
        success: true,
        data: order,
        message: '投资成功'
      };
    } catch (error) {
      console.error('投资失败:', error);
      ctx.throw(500, `投资失败: ${error.message}`);
    }
  },

  // 赎回投资
  async redeem(ctx) {
    try {
      const { orderId } = ctx.params;
      const userId = ctx.state.user.id;

      // 查找投资订单
      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        populate: ['jihua']
      });

      if (!order) {
        return ctx.notFound('投资订单不存在');
      }

      if (order.yonghu !== userId) {
        return ctx.forbidden('无权操作此订单');
      }

      if (order.zhuangtai !== 'redeemable') {
        return ctx.badRequest('订单尚未到期，无法赎回');
      }

      // 计算收益
      const investmentAmount = new Decimal(order.touziJinE);
      const yieldRate = new Decimal(order.jihua.yield_rate);
      const totalReturn = investmentAmount.mul(yieldRate).plus(investmentAmount);

      // 更新用户钱包
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { yonghu: userId }
      });
      
      let wallet = wallets[0];
      if (!wallet) {
        return ctx.badRequest('用户钱包不存在');
      }

      const currentBalance = new Decimal(wallet.usdtYue || 0);
      const newBalance = currentBalance.plus(totalReturn);

      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: {
          usdtYue: newBalance.toString()
        }
      });

      // 更新订单状态
      await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        data: {
          zhuangtai: 'completed',
          shouYi: totalReturn.minus(investmentAmount).toString(),
          huiShouShiJian: new Date()
        }
      });

      // 发送赎回成功通知
      try {
        await strapi.service('api::notification.notification').sendInAppMessage(
          userId,
          '投资赎回成功',
          `您的投资已赎回，获得收益：${totalReturn.minus(investmentAmount)} USDT`,
          'success'
        );
      } catch (notifyError) {
        console.error('发送通知失败:', notifyError);
      }

      ctx.body = {
        success: true,
        data: {
          order: order,
          totalReturn: totalReturn.toString(),
          profit: totalReturn.minus(investmentAmount).toString()
        },
        message: '赎回成功'
      };
    } catch (error) {
      console.error('赎回失败:', error);
      ctx.throw(500, `赎回失败: ${error.message}`);
    }
  },

  // 获取投资计划统计
  async getPlanStats(ctx) {
    try {
      const { planId } = ctx.params;

      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('投资计划不存在');
      }

      // 获取该计划的所有订单
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId }
      });

      const totalInvestment = orders.reduce((sum, order) => {
        return sum + parseFloat(order.touziJinE || 0);
      }, 0);

      const activeOrders = orders.filter(order => order.zhuangtai === 'active');
      const completedOrders = orders.filter(order => order.zhuangtai === 'completed');

      const totalProfit = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.shouYi || 0);
      }, 0);

      ctx.body = {
        data: {
          plan: plan,
          totalInvestment,
          totalOrders: orders.length,
          activeOrders: activeOrders.length,
          completedOrders: completedOrders.length,
          totalProfit
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取我的投资
  async getMyInvestments(ctx) {
    try {
      const userId = ctx.state.user.id;

      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { yonghu: userId },
        sort: { createdAt: 'desc' },
        populate: ['jihua']
      });

      ctx.body = {
        data: orders
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 赠送AI代币给计划参与者
  async giveTokenToPlanParticipants(ctx) {
    try {
      const { planId } = ctx.params;
      const { tokenId, amount, reason = '计划奖励' } = ctx.request.body;

      if (!tokenId || !amount) {
        return ctx.badRequest('缺少必要参数');
      }

      // 验证投资计划
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('投资计划不存在');
      }

      // 获取该计划的所有参与者
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId },
        populate: ['yonghu']
      });

      const results = [];
      
      for (const order of orders) {
        try {
          // 使用AI代币赠送服务
          await strapi.service('api::token-reward-record.token-reward-record').giveTokenReward({
            userId: order.yonghu.id,
            tokenId: tokenId,
            amount: amount,
            reason: `${reason} - 计划: ${plan.name}`,
            type: 'plan_reward'
          });

          results.push({
            userId: order.yonghu.id,
            username: order.yonghu.username,
            success: true,
            message: '赠送成功'
          });
        } catch (error) {
          results.push({
            userId: order.yonghu.id,
            username: order.yonghu.username,
            success: false,
            error: error.message
          });
        }
      }

      ctx.body = {
        success: true,
        data: {
          planId,
          planName: plan.name,
          totalParticipants: orders.length,
          results
        },
        message: '批量赠送完成'
      };
    } catch (error) {
      console.error('赠送AI代币失败:', error);
      ctx.throw(500, `赠送AI代币失败: ${error.message}`);
    }
  },

  // 赠送抽奖次数给计划参与者
  async giveLotteryChancesToPlanParticipants(ctx) {
    try {
      const { planId } = ctx.params;
      const { jiangpinId, count = 1, reason = '计划奖励' } = ctx.request.body;

      if (!jiangpinId || !count) {
        return ctx.badRequest('缺少必要参数');
      }

      // 验证投资计划
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('投资计划不存在');
      }

      // 获取该计划的所有参与者
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId },
        populate: ['yonghu']
      });

      const results = [];
      
      for (const order of orders) {
        try {
          // 使用抽奖机会赠送服务
          await strapi.service('api::choujiang-jihui.choujiang-jihui').giveChance({
            userId: order.yonghu.id,
            jiangpinId: jiangpinId,
            count: count,
            reason: `${reason} - 计划: ${plan.name}`,
            type: 'plan_reward'
          });

          results.push({
            userId: order.yonghu.id,
            username: order.yonghu.username,
            success: true,
            message: '赠送成功'
          });
        } catch (error) {
          results.push({
            userId: order.yonghu.id,
            username: order.yonghu.username,
            success: false,
            error: error.message
          });
        }
      }

      ctx.body = {
        success: true,
        data: {
          planId,
          planName: plan.name,
          totalParticipants: orders.length,
          results
        },
        message: '批量赠送完成'
      };
    } catch (error) {
      console.error('赠送抽奖次数失败:', error);
      ctx.throw(500, `赠送抽奖次数失败: ${error.message}`);
    }
  },

  // 获取计划参与者列表
  async getPlanParticipants(ctx) {
    try {
      const { planId } = ctx.params;
      const { page = 1, pageSize = 20 } = ctx.query;

      // 验证投资计划
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('投资计划不存在');
      }

      // 获取该计划的参与者
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId },
        populate: ['yonghu'],
        sort: { createdAt: 'desc' },
        limit: parseInt(pageSize as string),
        offset: (parseInt(page as string) - 1) * parseInt(pageSize as string)
      });

      const total = await strapi.entityService.count('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId }
      });

      ctx.body = {
        success: true,
        data: {
          plan: plan,
          participants: orders,
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            total,
            totalPages: Math.ceil(total / parseInt(pageSize as string))
          }
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 