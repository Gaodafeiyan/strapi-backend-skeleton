import { factories } from '@strapi/strapi';

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
      const invitee = order.yonghu;
      const referrerId = invitee.shangji?.id;
      if (!referrerId) return;

      const referrerOrders = await strapi
        .query('api::dinggou-dingdan.dinggou-dingdan')
        .sum('benjinUSDT', { where: { yonghu: referrerId, zhuangtai: 'finished' } });

      const aPrincipal = parseFloat(referrerOrders || '0');
      const bPrincipal = parseFloat(order.benjinUSDT);
      const tier = getTier(aPrincipal);
      const { static: rate, rebate } = RATE_TABLE[tier as keyof typeof RATE_TABLE];

      const reward = Math.min(aPrincipal, bPrincipal) * rate * rebate / 10000; // 两次百分比
      const rewardStr = reward.toFixed(2);

      if (reward <= 0) return;

      // ① 写奖励记录
      await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data: {
          shouyiUSDT: rewardStr,
          tuijianRen: referrerId,
          laiyuanRen: invitee.id,
          laiyuanDan: order.id,
        },
      });

      // ② 加钱
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(referrerId, rewardStr);
    },
  })
); 