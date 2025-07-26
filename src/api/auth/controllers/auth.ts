import { factories } from '@strapi/strapi';
import { generateInviteCode } from '../../../../utils/invite';
import { validateEmail, validateUsername, validatePassword, validateInviteCode, sanitizeInput } from '../../../../utils/validation';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    // 邀请注册
    async inviteRegister(ctx) {
      try {
        const { username, email, password, inviteCode } = ctx.request.body;
        
        if (!username || !email || !password || !inviteCode) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证邀请码
        const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { inviteCode }
        });

        if (inviteUser.length === 0) {
          return ctx.badRequest('邀请码无效');
        }

        // 创建新用户
        const newUser = await strapi.entityService.create('plugin::users-permissions.user', {
          data: {
            username,
            email,
            password,
            inviteCode: generateInviteCode(),
            invitedBy: inviteUser[0].id
          }
        });

        // 创建用户钱包
        await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: newUser.id
          } as any
        });

        ctx.body = {
          success: true,
          data: newUser,
          message: '注册成功'
        };
      } catch (error) {
        console.error('邀请注册失败:', error);
        ctx.throw(500, `注册失败: ${error.message}`);
      }
    }
  })
);

// 生成邀请码
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
} 