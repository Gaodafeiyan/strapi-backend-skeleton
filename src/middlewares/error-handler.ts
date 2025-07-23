import { isCustomError } from '../utils/errors';

export default (config: any, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    try {
      await next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const errorStack = error instanceof Error ? error.stack : '';
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      
      // 记录错误日志
      strapi.log.error('API错误:', {
        url: ctx.url,
        method: ctx.method,
        error: errorMessage,
        name: errorName,
        stack: errorStack,
        timestamp: new Date().toISOString(),
        userAgent: ctx.request.headers['user-agent'],
        ip: ctx.request.ip
      });

      // 根据错误类型返回不同的状态码和消息
      let statusCode = 500;
      let responseBody: any = { error: '服务器内部错误' };

      // 使用自定义错误类型进行精确匹配
      if (isCustomError(error)) {
        switch (error.name) {
          case 'ValidationError':
            statusCode = 400;
            responseBody = { 
              error: '数据验证失败', 
              message: errorMessage,
              details: (error as any).details
            };
            break;
          case 'InsufficientBalanceError':
            statusCode = 400;
            responseBody = { error: '余额不足', message: errorMessage };
            break;
          case 'WalletNotFoundError':
            statusCode = 404;
            responseBody = { error: '钱包不存在', message: errorMessage };
            break;
          case 'OrderNotFoundError':
            statusCode = 404;
            responseBody = { error: '订单不存在', message: errorMessage };
            break;
          case 'OrderNotExpiredError':
            statusCode = 400;
            responseBody = { error: '订单尚未到期', message: errorMessage };
            break;
          case 'ChoujiangJihuiExhaustedError':
            statusCode = 400;
            responseBody = { error: '抽奖机会已用完', message: errorMessage };
            break;
          case 'InvitationRewardError':
            statusCode = 500;
            responseBody = { error: '邀请奖励处理失败', message: errorMessage };
            break;
          default:
            statusCode = 500;
            responseBody = { error: '业务处理失败', message: errorMessage };
        }
      } else {
        // 兼容旧错误处理逻辑
        if (errorName === 'ValidationError' || errorMessage.includes('数据验证失败')) {
          statusCode = 400;
          responseBody = { 
            error: '数据验证失败', 
            message: errorMessage,
            details: error instanceof Error && (error as any).details ? (error as any).details : undefined
          };
        } else if (errorMessage.includes('余额不足') || errorMessage.includes('InsufficientBalance')) {
          statusCode = 400;
          responseBody = { error: '余额不足', message: errorMessage };
        } else if (errorMessage.includes('不存在') || errorMessage.includes('NotFound')) {
          statusCode = 404;
          responseBody = { error: '资源不存在', message: errorMessage };
        } else if (errorMessage.includes('无权') || errorMessage.includes('Forbidden')) {
          statusCode = 403;
          responseBody = { error: '权限不足', message: errorMessage };
        } else if (errorMessage.includes('未登录') || errorMessage.includes('Unauthorized')) {
          statusCode = 401;
          responseBody = { error: '请先登录', message: errorMessage };
        } else if (errorMessage.includes('订单尚未到期')) {
          statusCode = 400;
          responseBody = { error: '订单尚未到期', message: errorMessage };
        } else if (errorMessage.includes('抽奖机会已用完')) {
          statusCode = 400;
          responseBody = { error: '抽奖机会已用完', message: errorMessage };
        } else if (errorMessage.includes('邀请奖励失败')) {
          statusCode = 500;
          responseBody = { error: '邀请奖励处理失败', message: errorMessage };
        } else {
          statusCode = 500;
          responseBody = {
            error: '服务器内部错误',
            message: process.env.NODE_ENV === 'development' ? errorMessage : '请稍后重试',
            ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
          };
        }
      }

      ctx.status = statusCode;
      ctx.body = responseBody;
    }
  };
}; 