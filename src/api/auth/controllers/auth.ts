import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

// 简单的邀请码生成函数
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    async inviteRegister(ctx) {
      const { username, email, password, inviteCode } = ctx.request.body;

      try {
        // ① 找到上级
        const shangji = await strapi
          .query('plugin::users-permissions.user')
          .findOne({ where: { yaoqingMa: inviteCode } });
        if (!shangji) return ctx.badRequest('邀请码无效');

        // ② 生成邀请码
        const yaoqingMa = generateInviteCode();

        // ③ 创建用户
        const user = await strapi
          .plugin('users-permissions')
          .service('user')
          .add({
            username,
            email,
            password,
            shangji: shangji.id,
            yaoqingMa: yaoqingMa,
            confirmed: true, // 自动确认用户
            blocked: false,
            role: 1, // 自动分配 Authenticated 角色
          });

        // ④ 创建钱包
        await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: { yonghu: user.id },
        });

        ctx.body = { userId: user.id, success: true };
      } catch (e) {
        console.error('邀请码注册错误:', e);
        ctx.throw(500, '注册失败，请重试');
      }
    },
  })
); 