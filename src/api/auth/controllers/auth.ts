import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    async inviteRegister(ctx) {
      const { username, email, password, inviteCode } = ctx.request.body;

      // ① 找到上级
      const shangji = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { yaoqingMa: inviteCode } });
      if (!shangji) return ctx.badRequest('邀请码无效');

      // ② 创建用户 + 钱包（事务保证一致性）
      const trx = await strapi.db.transaction();
      try {
        const user = await strapi
          .plugin('users-permissions')
          .service('user')
          .add({
            username,
            email,
            password,
            shangji: shangji.id,
          });

        await strapi.entityService.create(
          'api::qianbao-yue.qianbao-yue',
          {
            data: { yonghu: user.id },
            transaction: trx,
          }
        );

        await trx.commit();
        ctx.body = { userId: user.id };
      } catch (e) {
        await trx.rollback();
        throw e;
      }
    },
  })
); 