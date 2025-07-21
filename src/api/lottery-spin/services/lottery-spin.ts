import { factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::lottery-spin.lottery-spin',
  ({ strapi }) => ({
    async spin(userId: number) {
      // ① 读 user.lotterySpins 自定义字段（或新建表）
      // ② roll 随机数，根据 lottery-prize 概率挑奖
      // ③ 发奖：钱包加钱或发 AI Token
      // ④ spins-- 并记录 spin
      
      // 临时实现
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userId
      );
      
      // 检查抽奖次数
      if (!user.lotterySpins || user.lotterySpins <= 0) {
        throw new Error('抽奖次数不足');
      }
      
      // 简单随机奖励
      const rewards = [
        { type: 'usdt', amount: '10' },
        { type: 'usdt', amount: '20' },
        { type: 'usdt', amount: '50' },
        { type: 'ai', amount: '0.1' },
        { type: 'ai', amount: '0.5' },
      ];
      
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      
      // 发奖
      if (randomReward.type === 'usdt') {
        await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(userId, randomReward.amount);
      } else {
        await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(userId, '0', randomReward.amount);
      }
      
      // 减少抽奖次数
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        userId,
        { data: { lotterySpins: user.lotterySpins - 1 } }
      );
      
      return { reward: randomReward };
    },
  })
); 