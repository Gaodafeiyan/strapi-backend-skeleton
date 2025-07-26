import { factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::data-integrity.data-integrity',
  ({ strapi }) => ({
    // 检查用户数据完整性
    async checkUserDataIntegrity(userId: number) {
      try {
        const issues = [];

        // 检查用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        if (!user) {
          issues.push('用户不存在');
          return { userId, issues, isValid: false };
        }

        // 检查钱包是否存在
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
        });

        if (wallets.length === 0) {
          issues.push('用户钱包不存在');
        } else if (wallets.length > 1) {
          issues.push('用户有多个钱包记录');
        }

        // 检查订单数据
        const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
          filters: { user: userId } as any
        });

        // 检查提现记录
        const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
          filters: { user: userId } as any
        });

        // 检查充值记录
        const deposits = await strapi.entityService.findMany('api::qianbao-chongzhi.qianbao-chongzhi', {
          filters: { user: userId } as any
        });

        // 检查抽奖机会
        const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
          filters: { user: userId } as any
        });

        return {
          userId,
          issues,
          isValid: issues.length === 0,
          summary: {
            wallets: wallets.length,
            orders: orders.length,
            withdrawals: withdrawals.length,
            deposits: deposits.length,
            chances: chances.length
          }
        };
      } catch (error) {
        console.error('检查用户数据完整性失败:', error);
        throw error;
      }
    },

    // 修复用户数据
    async fixUserData(userId: number) {
      try {
        const fixes = [];

        // 检查并创建钱包
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId } as any
        });

        if (wallets.length === 0) {
          // 创建钱包
          await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
            data: {
              usdtYue: '0',
              aiYue: '0',
              aiTokenBalances: '{}',
              user: userId
            } as any
          });
          fixes.push('创建了用户钱包');
        }

        return {
          userId,
          fixes,
          success: true
        };
      } catch (error) {
        console.error('修复用户数据失败:', error);
        throw error;
      }
    }
  })
);
