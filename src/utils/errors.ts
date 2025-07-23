// 自定义错误类
export class InsufficientBalanceError extends Error {
  constructor(message: string = '余额不足') {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
}

export class WalletNotFoundError extends Error {
  constructor(message: string = '钱包不存在') {
    super(message);
    this.name = 'WalletNotFoundError';
  }
}

export class OrderNotFoundError extends Error {
  constructor(message: string = '订单不存在') {
    super(message);
    this.name = 'OrderNotFoundError';
  }
}

export class OrderNotExpiredError extends Error {
  constructor(message: string = '订单尚未到期') {
    super(message);
    this.name = 'OrderNotExpiredError';
  }
}

export class ChoujiangJihuiExhaustedError extends Error {
  constructor(message: string = '抽奖机会已用完') {
    super(message);
    this.name = 'ChoujiangJihuiExhaustedError';
  }
}

export class InvitationRewardError extends Error {
  constructor(message: string = '邀请奖励处理失败') {
    super(message);
    this.name = 'InvitationRewardError';
  }
}

export class ValidationError extends Error {
  public details?: any;
  
  constructor(message: string = '数据验证失败', details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

// 错误类型检查函数
export function isCustomError(error: any): error is Error {
  return error instanceof Error && [
    'InsufficientBalanceError',
    'WalletNotFoundError', 
    'OrderNotFoundError',
    'OrderNotExpiredError',
    'ChoujiangJihuiExhaustedError',
    'InvitationRewardError',
    'ValidationError'
  ].includes(error.name);
} 