import { factories } from '@strapi/strapi';
import { generateInviteCode } from '../../../../utils/invite';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    async inviteRegister(ctx) {
      const { username, email, password, inviteCode } = ctx.request.body;

      try {
        /* 1. 找上级 -------------------------------------------------------- */
        const referrer = await strapi.db.query('plugin::users-permissions.user')
          .findOne({ where: { yaoqingMa: inviteCode } });
        if (!referrer) return ctx.badRequest('邀请码无效');

        /* 2. 生成唯一邀请码 ------------------------------------------------ */
        let myCode: string;
        while (true) {
          const code = generateInviteCode();
          const hit = await strapi.db.query('plugin::users-permissions.user')
            .findOne({ where: { yaoqingMa: code } });
          if (!hit) { myCode = code; break; }
        }

        /* 3. 智能获取 Authenticated 角色 --------------------------------- */
        let authRole;
        try {
          if (strapi.plugin('users-permissions').service('role').getAuthenticatedRole) {
            authRole = await strapi.plugin('users-permissions')
              .service('role')
              .getAuthenticatedRole();
          } else {
            authRole = await strapi.db.query('plugin::users-permissions.role')
              .findOne({ where: { type: 'authenticated' } });
          }
        } catch (error) {
          console.error('获取角色失败，使用默认角色ID 1:', error);
          authRole = { id: 1 };
        }

        /* 4. 创建用户 ------------------------------------------------------ */
        const newUser = await strapi.plugin('users-permissions')
          .service('user')
          .add({
            username,
            email,
            password,
            role: authRole.id,
            provider: 'local',
            confirmed: true,
            yaoqingMa: myCode,
            shangji: referrer.id,
          });

        /* 5. 创建钱包 ------------------------------------------------------ */
        await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: { yonghu: newUser.id },
        });

        ctx.body = { userId: newUser.id, success: true };
      } catch (error) {
        console.error('邀请码注册错误:', error);
        ctx.throw(500, `注册失败: ${error.message}`);
      }
    },
  })
); 