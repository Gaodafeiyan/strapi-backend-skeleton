import { ValidationError } from './errors';

/**
 * 验证用户ID
 */
export function validateUserId(userId: any): number {
  if (!userId) {
    throw new ValidationError('用户ID不能为空');
  }
  
  const id = parseInt(userId);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('用户ID必须是正整数');
  }
  
  return id;
}

/**
 * 验证金额
 */
export function validateAmount(amount: any, fieldName: string = '金额'): string {
  if (!amount) {
    throw new ValidationError(`${fieldName}不能为空`);
  }
  
  const amountStr = amount.toString();
  const decimalRegex = /^\d+(\.\d{1,8})?$/;
  
  if (!decimalRegex.test(amountStr)) {
    throw new ValidationError(`${fieldName}格式不正确，最多支持8位小数`);
  }
  
  const decimal = parseFloat(amountStr);
  if (decimal < 0) {
    throw new ValidationError(`${fieldName}不能为负数`);
  }
  
  return amountStr;
}

/**
 * 验证订单ID
 */
export function validateOrderId(orderId: any): number {
  if (!orderId) {
    throw new ValidationError('订单ID不能为空');
  }
  
  const id = parseInt(orderId);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('订单ID必须是正整数');
  }
  
  return id;
}

/**
 * 验证抽奖机会ID
 */
export function validateJihuiId(jihuiId: any): number {
  if (!jihuiId) {
    throw new ValidationError('抽奖机会ID不能为空');
  }
  
  const id = parseInt(jihuiId);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('抽奖机会ID必须是正整数');
  }
  
  return id;
}

/**
 * 验证投资计划ID
 */
export function validateJihuaId(jihuaId: any): number {
  if (!jihuaId) {
    throw new ValidationError('投资计划ID不能为空');
  }
  
  const id = parseInt(jihuaId);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('投资计划ID必须是正整数');
  }
  
  return id;
}

/**
 * 验证商品ID
 */
export function validateProductId(productId: any): number {
  if (!productId) {
    throw new ValidationError('商品ID不能为空');
  }
  
  const id = parseInt(productId);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('商品ID必须是正整数');
  }
  
  return id;
}

/**
 * 验证数量
 */
export function validateQuantity(quantity: any, fieldName: string = '数量'): number {
  if (!quantity) {
    throw new ValidationError(`${fieldName}不能为空`);
  }
  
  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    throw new ValidationError(`${fieldName}必须是正整数`);
  }
  
  return qty;
}

/**
 * 验证分页参数
 */
export function validatePagination(page: any, pageSize: any) {
  const pageNum = parseInt(page) || 1;
  const size = parseInt(pageSize) || 10;
  
  if (pageNum < 1) {
    throw new ValidationError('页码必须大于0');
  }
  
  if (size < 1 || size > 100) {
    throw new ValidationError('每页数量必须在1-100之间');
  }
  
  return { page: pageNum, pageSize: size };
}

/**
 * 验证搜索关键词
 */
export function validateSearchKeyword(keyword: any): string {
  if (!keyword) {
    return '';
  }
  
  const keywordStr = keyword.toString().trim();
  if (keywordStr.length > 100) {
    throw new ValidationError('搜索关键词不能超过100个字符');
  }
  
  return keywordStr;
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: any): string {
  if (!email) {
    throw new ValidationError('邮箱不能为空');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('邮箱格式不正确');
  }
  
  return email;
}

/**
 * 验证手机号格式
 */
export function validatePhone(phone: any): string {
  if (!phone) {
    throw new ValidationError('手机号不能为空');
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('手机号格式不正确');
  }
  
  return phone;
}

/**
 * 验证邀请码格式
 */
export function validateInviteCode(code: any): string {
  if (!code) {
    throw new ValidationError('邀请码不能为空');
  }
  
  const codeStr = code.toString().trim();
  if (codeStr.length !== 9) {
    throw new ValidationError('邀请码必须是9位字符');
  }
  
  return codeStr;
}

/**
 * 验证订单号格式
 */
export function validateOrderNumber(orderNumber: any): string {
  if (!orderNumber) {
    throw new ValidationError('订单号不能为空');
  }
  
  const orderNumberStr = orderNumber.toString().trim();
  if (orderNumberStr.length < 10 || orderNumberStr.length > 20) {
    throw new ValidationError('订单号长度必须在10-20位之间');
  }
  
  return orderNumberStr;
}

/**
 * 验证地址信息
 */
export function validateAddress(address: any): string {
  if (!address) {
    throw new ValidationError('地址不能为空');
  }
  
  const addressStr = address.toString().trim();
  if (addressStr.length < 5 || addressStr.length > 200) {
    throw new ValidationError('地址长度必须在5-200个字符之间');
  }
  
  return addressStr;
}

/**
 * 验证姓名
 */
export function validateName(name: any): string {
  if (!name) {
    throw new ValidationError('姓名不能为空');
  }
  
  const nameStr = name.toString().trim();
  if (nameStr.length < 2 || nameStr.length > 20) {
    throw new ValidationError('姓名长度必须在2-20个字符之间');
  }
  
  return nameStr;
} 