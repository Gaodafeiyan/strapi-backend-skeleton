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

        // ② 加钱
        await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(referrerId, rewardStr);
        
        console.log('✅ 上级钱包余额已更新');
        console.log('=== 邀请奖励服务完成 ===');
        
      } catch (error) {
        console.error('❌ 邀请奖励服务执行失败:', error);
        throw error;
      }
    },
  })
); 