import { Context, Next } from 'koa';

// 敏感操作列表
const SENSITIVE_OPERATIONS = [
  '/api/qianbao-tixians',
  '/api/dinggou-dingdans',
  '/api/qianbao-chongzhis',
  '/api/auth/local',
  '/api/auth/register'
];

export default () => {
  return async (ctx: Context, next: Next) => {
    const startTime = Date.now();
    const { method, url, ip } = ctx.request;
    const userId = ctx.state.user?.id || 'anonymous';
    
    // 检查是否为敏感操作
    const isSensitive = SENSITIVE_OPERATIONS.some(op => url.includes(op));
    
    if (isSensitive) {
      console.log(`🔍 审计日志: ${method} ${url} - 用户: ${userId} - IP: ${ip} - 时间: ${new Date().toISOString()}`);
    }
    
    try {
      await next();
      
      const duration = Date.now() - startTime;
      
      if (isSensitive) {
        console.log(`✅ 操作完成: ${method} ${url} - 状态: ${ctx.status} - 耗时: ${duration}ms`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (isSensitive) {
        console.error(`❌ 操作失败: ${method} ${url} - 状态: ${ctx.status} - 耗时: ${duration}ms - 错误: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      throw error;
    }
  };
}; 