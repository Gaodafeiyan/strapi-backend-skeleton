import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

const RATE_TABLE = {
  500:  { static: 6, rebate: 100 },
  1000: { static: 7, rebate: 90  },
  2000: { static: 8, rebate: 80  },
  5000: { static: 10, rebate: 70 },
};

function getTier(amount: number) {
  if (amount >= 5000) return 5000;
  if (amount >= 2000) return 2000;
  if (amount >= 1000) return 1000;
  return 500;
}

export default factories.createCoreService(
  'api::yaoqing-jiangli.yaoqing-jiangli',
  ({ strapi }) => ({
    async createReferralReward(order: any) {
      console.log('=== 邀请奖励服务开始 ===');
      console.log('订单信息:', {
        orderId: order.id,
        benjinUSDT: order.benjinUSDT,
        yonghuId: order.yonghu?.id
      });
      
      const invitee = order.yonghu;
      if (!invitee) {
        console.log('❌ 订单没有关联用户');
        return;
      }
      
      console.log('下级用户信息:', {
        id: invitee.id,
        username: invitee.username,
        shangji: invitee.shangji
      });
      
      const referrerId = invitee.shangji?.id;
      if (!referrerId) {
        console.log('❌ 下级用户没有上级，跳过邀请奖励');
        return;
      }
      
      console.log('✅ 上级用户ID:', referrerId);

      try {
        const finishedOrders = await strapi.entityService.findMany(
          'api::dinggou-dingdan.dinggou-dingdan',
          {
            filters: { yonghu: referrerId, zhuangtai: 'finished' },
            fields: ['benjinUSDT'],
            limit: -1,
          }
        ) as any[];

        console.log('上级已完成订单数量:', finishedOrders.length);

        const aPrincipal = finishedOrders.reduce(
          (acc, o) => acc.plus(o.benjinUSDT || 0),
          new Decimal(0)
        );
        const bPrincipal = new Decimal(order.benjinUSDT);
        const tier = getTier(aPrincipal.toNumber());
        const { static: rate, rebate } = RATE_TABLE[tier as keyof typeof RATE_TABLE];

        console.log('奖励计算参数:', {
          aPrincipal: aPrincipal.toString(),
          bPrincipal: bPrincipal.toString(),
          tier,
          rate,
          rebate
        });

        const reward = Decimal.min(aPrincipal, bPrincipal)
          .mul(rate)
          .mul(rebate)
          .div(10000);
        const rewardStr = reward.toFixed(2);

        console.log('计算出的奖励:', rewardStr);

        if (reward.isZero()) {
          console.log('❌ 奖励为0，跳过');
          return;
        }

        // ① 写奖励记录
        const rewardRecord = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
          data: {
            shouyiUSDT: rewardStr,
            tuijianRen: referrerId,
            laiyuanRen: invitee.id,
            laiyuanDan: order.id,
          },
        });
        
        console.log('✅ 奖励记录创建成功:', rewardRecord.id);

        // ② 加钱 - 添加详细的错误处理
        try {
          console.log('开始更新钱包余额，用户ID:', referrerId.toString(), '金额:', rewardStr);
          
          // 先检查钱包是否存在
          const wallets = await strapi.entityService.findMany(
            'api::qianbao-yue.qianbao-yue',
            { filters: { yonghu: { id: referrerId } } }
          );
          
          console.log('找到的钱包数量:', wallets.length);
          
          if (wallets.length === 0) {
            console.error('❌ 用户钱包不存在，用户ID:', referrerId);
            return;
          }
          
          const wallet = wallets[0];
          console.log('钱包信息:', {
            id: wallet.id,
            currentBalance: wallet.usdtYue,
            userId: referrerId.toString()
          });
          
          // 直接更新钱包，不调用钱包服务
          const currentBalance = new Decimal(wallet.usdtYue || 0);
          const addAmount = new Decimal(rewardStr);
          const newBalance = currentBalance.plus(addAmount).toFixed(2);
          
          console.log('直接计算新余额:', {
            oldBalance: wallet.usdtYue,
            addAmount: rewardStr,
            newBalance: newBalance.toString()
          });
          
          // 强制刷新数据库连接
          console.log('强制刷新数据库连接...');
          
          // 直接更新钱包记录
          const updateResult = await strapi.entityService.update(
            'api::qianbao-yue.qianbao-yue',
            wallet.id,
            { data: { usdtYue: newBalance } }
          );
          
          console.log('✅ 钱包直接更新成功:', {
            id: updateResult.id,
            newBalance: updateResult.usdtYue,
            updatedAt: updateResult.updatedAt
          });
          
          // 等待一下确保数据库更新完成
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 验证更新结果 - 强制重新查询
          console.log('强制重新查询验证结果...');
          const updatedWallets = await strapi.entityService.findMany(
            'api::qianbao-yue.qianbao-yue',
            { filters: { yonghu: { id: referrerId } } }
          );
          
          if (updatedWallets.length > 0) {
            const newBalanceActual = updatedWallets[0].usdtYue;
            const oldBalance = wallet.usdtYue;
            const balanceChange = parseFloat(newBalanceActual) - parseFloat(oldBalance);
            
            console.log('钱包更新结果:', {
              oldBalance,
              newBalance: newBalanceActual,
              balanceChange: balanceChange.toString(),
              expectedChange: rewardStr,
              updatedAt: updatedWallets[0].updatedAt
            });
            
            if (Math.abs(balanceChange - parseFloat(rewardStr)) < 0.01) {
              console.log('✅ 上级钱包余额已正确更新');
            } else {
              console.error('❌ 钱包余额更新异常，期望增加:', rewardStr, '实际增加:', balanceChange.toString());
              console.error('⚠️ 可能是数据库事务或缓存问题');
            }
          }
          
        } catch (walletError) {
          console.error('❌ 钱包更新失败:', walletError);
          console.error('钱包错误详情:', walletError.message);
          console.error('钱包错误堆栈:', walletError.stack);
          
          // 钱包更新失败不影响奖励记录创建
          console.log('⚠️ 钱包更新失败，但奖励记录已创建');
        }
        
        console.log('=== 邀请奖励服务完成 ===');
        
      } catch (error) {
        console.error('❌ 邀请奖励服务执行失败:', error);
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
        throw error;
      }
    },
  })
); 