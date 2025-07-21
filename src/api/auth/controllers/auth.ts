import { factories } from '@strapi/strapi';
import { generateInviteCode } from '../../../../utils/invite';
import { validateEmail, validateUsername, validatePassword, validateInviteCode, sanitizeInput } from '../../../../utils/validation';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    async inviteRegister(ctx) {
      const { username, email, password, inviteCode } = ctx.request.body;

      try {
        // 输入验证和清理
        const cleanUsername = sanitizeInput(username);
        const cleanEmail = sanitizeInput(email);
        const cleanInviteCode = sanitizeInput(inviteCode);
        
        if (!validateUsername(cleanUsername)) {
          return ctx.badRequest('用户名至少3个字符，最多20个字符');
        }
        
        if (!validateEmail(cleanEmail)) {
          return ctx.badRequest('邮箱格式无效');
        }
        
        if (!validatePassword(password)) {
          return ctx.badRequest('密码至少6个字符');
        }
        
        if (!validateInviteCode(cleanInviteCode)) {
          return ctx.badRequest('邀请码格式无效');
        }

        // 检查用户名和邮箱是否已存在
        const existingUser = await strapi.db.query('plugin::users-permissions.user')
          .findOne({ 
            where: { 
              $or: [
                { username: cleanUsername },
                { email: cleanEmail }
              ]
            } 
          });
        
        if (existingUser) {
          return ctx.badRequest('用户名或邮箱已存在');
        }

        /* 1. 找上级 -------------------------------------------------------- */
        const referrer = await strapi.db.query('plugin::users-permissions.user')
          .findOne({ where: { yaoqingMa: cleanInviteCode } });
        if (!referrer) return ctx.badRequest('邀请码无效');

        /* 2. 生成唯一邀请码 ------------------------------------------------ */
        let myCode: string | null = null;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          const code = generateInviteCode();
          const hit = await strapi.db.query('plugin::users-permissions.user')
            .findOne({ where: { yaoqingMa: code } });
          if (!hit) { 
            myCode = code; 
            break; 
          }
          attempts++;
        }
        
        if (!myCode) {
          return ctx.internalServerError('生成邀请码失败，请重试');
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
            username: cleanUsername,
            email: cleanEmail,
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

        ctx.body = { 
          success: true, 
          userId: newUser.id,
          message: '注册成功',
          inviteCode: myCode
        };
      } catch (error) {
        console.error('邀请码注册错误:', error);
        ctx.throw(500, `注册失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },
  })
); 