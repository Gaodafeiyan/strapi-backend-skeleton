export default (config: any, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    try {
      await next();
    } catch (error) {
      console.error('API错误:', {
        url: ctx.url,
        method: ctx.method,
        error: error.message,
        stack: error.stack
      });

      // 根据错误类型返回不同的状态码
      if (error.message.includes('余额不足')) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      } else if (error.message.includes('不存在')) {
        ctx.status = 404;
        ctx.body = { error: error.message };
      } else if (error.message.includes('无权')) {
        ctx.status = 403;
        ctx.body = { error: error.message };
      } else if (error.message.includes('未登录')) {
        ctx.status = 401;
        ctx.body = { error: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { 
          error: '服务器内部错误',
          message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
        };
      }
    }
  };
}; 