export default (config: any, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    try {
      await next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const errorStack = error instanceof Error ? error.stack : '';
      
      console.error('API错误:', {
        url: ctx.url,
        method: ctx.method,
        error: errorMessage,
        stack: errorStack
      });

      // 根据错误类型返回不同的状态码
      if (errorMessage.includes('余额不足')) {
        ctx.status = 400;
                ctx.body = { error: errorMessage };
      } else if (errorMessage.includes('不存在')) {
        ctx.status = 404;
        ctx.body = { error: errorMessage };
      } else if (errorMessage.includes('无权')) {
        ctx.status = 403;
        ctx.body = { error: errorMessage };
      } else if (errorMessage.includes('未登录')) {
        ctx.status = 401;
        ctx.body = { error: errorMessage };
      } else {
        ctx.status = 500;
        ctx.body = {
          error: '服务器内部错误',
          message: process.env.NODE_ENV === 'development' ? errorMessage : '请稍后重试'
        };
      }
    }
  };
}; 