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
            filters: { yonghu: referrerId, status: 'finished' },
            fields: ['amount'],
            limit: -1,
          }
        ) as any[];

        console.log('上级已完成订单数量:', finishedOrders.length);

        const aPrincipal = finishedOrders.reduce(
          (acc, o) => acc.plus(o.amount || 0),
          new Decimal(0)
        );
        const bPrincipal = new Decimal(order.amount);
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

        // ② 加钱 - 使用事务确保数据一致性
        try {
          console.log('开始更新钱包余额，用户ID:', referrerId.toString(), '金额:', rewardStr);
          
          // 使用事务更新钱包
          await strapi.db.transaction(async (trx) => {
            const wallet = await trx.query('api::qianbao-yue.qianbao-yue').findOne({
              where: { yonghu: referrerId },
              lock: true
            });
            
            if (!wallet) {
              console.error('❌ 用户钱包不存在，用户ID:', referrerId);
              throw new Error('用户钱包不存在');
            }
            
            console.log('钱包信息:', {
              id: wallet.id,
              currentBalance: wallet.usdtYue,
              userId: referrerId.toString()
            });
            
            const currentBalance = new Decimal(wallet.usdtYue || 0);
            const addAmount = new Decimal(rewardStr);
            const newBalance = currentBalance.plus(addAmount).toFixed(2);
            
            console.log('计算新余额:', {
              oldBalance: wallet.usdtYue,
              addAmount: rewardStr,
              newBalance: newBalance.toString()
            });
            
            const updateResult = await trx.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: { usdtYue: newBalance }
            });
            
            console.log('✅ 钱包更新成功:', {
              id: updateResult.id,
              newBalance: updateResult.usdtYue,
              updatedAt: updateResult.updatedAt
            });
          });
          
        } catch (walletError) {
          console.error('❌ 钱包更新失败:', walletError);
          console.error('钱包错误详情:', walletError.message);
          console.error('钱包错误堆栈:', walletError.stack);
          
          // 钱包更新失败，回滚奖励记录
          try {
            await strapi.entityService.delete('api::yaoqing-jiangli.yaoqing-jiangli', rewardRecord.id);
            console.log('✅ 已回滚奖励记录');
          } catch (rollbackError) {
            console.error('❌ 回滚奖励记录失败:', rollbackError);
          }
          
          throw new Error(`邀请奖励失败: ${walletError.message}`);
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