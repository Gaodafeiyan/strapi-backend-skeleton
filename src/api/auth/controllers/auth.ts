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

        /* 3. 先测试基础注册（不添加自定义字段） --------------------------- */
        const newUser = await strapi.plugin('users-permissions')
          .service('user')
          .register({
            username,
            email,
            password,
            role: 1,  // 直接硬编码
            provider: 'local',
            confirmed: true,
          });

        /* 4. 注册成功后，再更新自定义字段 -------------------------------- */
        await strapi.entityService.update('plugin::users-permissions.user', newUser.id, {
          data: {
            yaoqingMa: myCode,
            shangji: referrer.id,
          }
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