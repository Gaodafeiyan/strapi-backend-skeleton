import { Context, Next } from 'koa';

// 简单的内存限流器
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export default (options: { windowMs?: number; max?: number } = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15分钟
  const max = options.max || 100; // 最大请求数

  return async (ctx: Context, next: Next) => {
    const key = ctx.ip || 'unknown';
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      // 重置或创建新记录
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      // 增加计数
      record.count++;
      
      if (record.count > max) {
        ctx.status = 429;
        ctx.body = {
          error: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        };
        return;
      }
    }
    
    await next();
  };
}; 