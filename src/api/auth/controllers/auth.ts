import { factories } from '@strapi/strapi';
import { generateInviteCode } from '../../../../utils/invite';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    async inviteRegister(ctx) {
      const { username, email, password, inviteCode } = ctx.request.body;

      /* ① 校验上级邀请码 ------------------------------------------------ */
      const referrer = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { yaoqingMa: inviteCode } });
      if (!referrer) return ctx.badRequest('邀请码无效');

      /* ② 生成自己的邀请码 ---------------------------------------------- */
      const yaoqingMa = generateInviteCode();

      /* ③ 获取 Authenticated 角色 ID ------------------------------------ */
      const authRole = await strapi
        .plugin('users-permissions')
        .service('role')
        .getAuthenticatedRole();

      /* ④ 调官方 register —— 一步写全字段 ----------------------------- */
      const newUser = await strapi
        .plugin('users-permissions')
        .service('user')
        .register({
          username,
          email,
          password,
          role: authRole.id,
          provider: 'local',        // 可不写，register 默认就是 local
          confirmed: true,          // 若要邮件确认改成 false
          yaoqingMa,                // 自己的邀请码
          shangji: referrer.id,     // 上级
        });

      /* ⑤ 创建钱包 ------------------------------------------------------ */
      await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
        data: { yonghu: newUser.id },
      });

      ctx.body = { userId: newUser.id, success: true };
    },
  })
); 