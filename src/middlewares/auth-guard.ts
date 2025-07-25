/**
 * 权限验证中间件
 * 加强接口的权限控制，防止未授权访问
 */

export default (config: any, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    try {
      // 检查用户是否已认证
      if (!ctx.state.user) {
        return ctx.unauthorized('用户未登录');
      }

      const user = ctx.state.user;
      
      // 检查用户状态
      if (user.blocked) {
        return ctx.forbidden('账户已被禁用');
      }

      // 检查用户角色权限
      if (user.role && user.role.type) {
        const requiredRole = config.requiredRole;
        if (requiredRole && user.role.type !== requiredRole) {
          return ctx.forbidden('权限不足');
        }
      }

      // 检查特定权限
      if (config.requiredPermissions) {
        const userPermissions = user.role?.permissions || {};
        const hasPermission = config.requiredPermissions.some((permission: string) => 
          userPermissions[permission]?.enabled
        );
        
        if (!hasPermission) {
          return ctx.forbidden('缺少必要权限');
        }
      }

      // 检查用户操作频率限制
      if (config.rateLimit) {
        const { maxRequests, windowMs } = config.rateLimit;
        const key = `rate_limit:${user.id}:${ctx.path}`;
        
        // 这里可以集成Redis或其他缓存系统进行限流
        // 暂时使用简单的内存限流
        const now = Date.now();
        const userRequests = strapi.cache.get(key) || { count: 0, resetTime: now + windowMs };
        
        if (now > userRequests.resetTime) {
          userRequests.count = 1;
          userRequests.resetTime = now + windowMs;
        } else if (userRequests.count >= maxRequests) {
          return ctx.tooManyRequests('请求过于频繁，请稍后重试');
        } else {
          userRequests.count++;
        }
        
        strapi.cache.set(key, userRequests, windowMs / 1000);
      }

      // 记录用户操作日志
      if (config.audit) {
        strapi.log.info('用户操作', {
          userId: user.id,
          username: user.username,
          path: ctx.path,
          method: ctx.method,
          ip: ctx.request.ip,
          userAgent: ctx.request.headers['user-agent'],
          timestamp: new Date().toISOString()
        });
      }

      await next();
    } catch (error) {
      strapi.log.error('权限验证中间件错误:', error);
      return ctx.internalServerError('权限验证失败');
    }
  };
}; 