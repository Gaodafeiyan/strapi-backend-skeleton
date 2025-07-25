/**
 * 并发控制工具
 * 解决高并发场景下的竞态条件问题
 */

import { getCurrentTimestamp } from './timezone';

// 存储正在执行的操作
const activeOperations = new Map<string, Promise<any>>();

// 存储操作锁
const operationLocks = new Map<string, boolean>();

/**
 * 操作锁接口
 */
interface OperationLock {
  key: string;
  timestamp: number;
  timeout: number;
}

/**
 * 获取操作锁
 * @param key 锁的键名
 * @param timeout 超时时间（毫秒）
 * @returns 是否成功获取锁
 */
export function acquireLock(key: string, timeout: number = 30000): boolean {
  const now = getCurrentTimestamp();
  const existingLock = operationLocks.get(key);
  
  if (existingLock) {
    return false;
  }
  
  operationLocks.set(key, true);
  return true;
}

/**
 * 释放操作锁
 * @param key 锁的键名
 */
export function releaseLock(key: string): void {
  operationLocks.delete(key);
}

/**
 * 带锁的操作执行器
 * @param key 锁的键名
 * @param operation 要执行的操作
 * @param timeout 超时时间（毫秒）
 * @returns 操作结果
 */
export async function executeWithLock<T>(
  key: string, 
  operation: () => Promise<T>, 
  timeout: number = 30000
): Promise<T> {
  const lockKey = `lock:${key}`;
  
  // 尝试获取锁
  if (!acquireLock(lockKey, timeout)) {
    throw new Error('操作正在执行中，请稍后重试');
  }
  
  try {
    // 执行操作
    const result = await operation();
    return result;
  } finally {
    // 释放锁
    releaseLock(lockKey);
  }
}

/**
 * 防重复执行装饰器
 * @param key 操作的唯一标识
 * @param timeout 超时时间（毫秒）
 */
export function preventDuplicateExecution(key: string, timeout: number = 30000) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const operationKey = `${key}:${propertyName}:${JSON.stringify(args)}`;
      
      // 检查是否已有相同的操作在执行
      if (activeOperations.has(operationKey)) {
        throw new Error('相同操作正在执行中，请稍后重试');
      }
      
      // 创建操作Promise
      const operationPromise = executeWithLock(operationKey, async () => {
        return await method.apply(this, args);
      }, timeout);
      
      // 存储操作
      activeOperations.set(operationKey, operationPromise);
      
      try {
        const result = await operationPromise;
        return result;
      } finally {
        // 清理操作记录
        activeOperations.delete(operationKey);
      }
    };
    
    return descriptor;
  };
}

/**
 * 用户操作限流器
 */
export class UserRateLimiter {
  private userOperations = new Map<string, { count: number; resetTime: number }>();
  
  /**
   * 检查用户操作频率
   * @param userId 用户ID
   * @param operation 操作类型
   * @param maxCount 最大次数
   * @param windowMs 时间窗口（毫秒）
   * @returns 是否允许操作
   */
  checkRateLimit(userId: string, operation: string, maxCount: number, windowMs: number): boolean {
    const key = `${userId}:${operation}`;
    const now = getCurrentTimestamp();
    const userOp = this.userOperations.get(key);
    
    if (!userOp || now > userOp.resetTime) {
      // 重置计数器
      this.userOperations.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (userOp.count >= maxCount) {
      return false;
    }
    
    userOp.count++;
    return true;
  }
  
  /**
   * 清理过期的限流记录
   */
  cleanup(): void {
    const now = getCurrentTimestamp();
    for (const [key, value] of this.userOperations.entries()) {
      if (now > value.resetTime) {
        this.userOperations.delete(key);
      }
    }
  }
}

/**
 * 全局限流器实例
 */
export const globalRateLimiter = new UserRateLimiter();

/**
 * 定期清理过期记录
 */
setInterval(() => {
  globalRateLimiter.cleanup();
}, 60000); // 每分钟清理一次

/**
 * 数据库行级锁工具
 */
export class DatabaseRowLock {
  /**
   * 使用数据库行锁执行操作
   * @param strapi Strapi实例
   * @param tableName 表名
   * @param rowId 行ID
   * @param operation 操作函数
   * @returns 操作结果
   */
  static async executeWithRowLock<T>(
    strapi: any,
    tableName: string,
    rowId: number,
    operation: (trx: any) => Promise<T>
  ): Promise<T> {
    return await strapi.db.transaction(async (trx: any) => {
      // 使用 SELECT ... FOR UPDATE 获取行锁
      const row = await trx.query(tableName).findOne({
        where: { id: rowId },
        lock: true
      });
      
      if (!row) {
        throw new Error(`${tableName} 记录不存在: ${rowId}`);
      }
      
      // 执行操作
      return await operation(trx);
    });
  }
}

/**
 * 乐观锁工具
 */
export class OptimisticLock {
  /**
   * 使用乐观锁更新数据
   * @param strapi Strapi实例
   * @param tableName 表名
   * @param rowId 行ID
   * @param version 当前版本号
   * @param updateData 更新数据
   * @param maxRetries 最大重试次数
   * @returns 更新结果
   */
  static async updateWithOptimisticLock(
    strapi: any,
    tableName: string,
    rowId: number,
    version: number,
    updateData: any,
    maxRetries: number = 3
  ): Promise<any> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const result = await strapi.db.transaction(async (trx: any) => {
          // 检查版本号
          const row = await trx.query(tableName).findOne({
            where: { id: rowId }
          });
          
          if (!row) {
            throw new Error(`${tableName} 记录不存在: ${rowId}`);
          }
          
          if (row.version !== version) {
            throw new Error('数据已被其他用户修改，请刷新后重试');
          }
          
          // 更新数据和版本号
          const updatedData = {
            ...updateData,
            version: version + 1
          };
          
          return await trx.query(tableName).update({
            where: { id: rowId },
            data: updatedData
          });
        });
        
        return result;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 100 * retries));
      }
    }
  }
}

/**
 * 分布式锁工具（基于Redis或内存）
 */
export class DistributedLock {
  private locks = new Map<string, { owner: string; expireTime: number }>();
  
  /**
   * 尝试获取分布式锁
   * @param key 锁的键名
   * @param owner 锁的所有者
   * @param ttl 锁的生存时间（毫秒）
   * @returns 是否成功获取锁
   */
  tryAcquire(key: string, owner: string, ttl: number = 30000): boolean {
    const now = getCurrentTimestamp();
    const existingLock = this.locks.get(key);
    
    if (existingLock && now < existingLock.expireTime) {
      return false;
    }
    
    this.locks.set(key, {
      owner,
      expireTime: now + ttl
    });
    
    return true;
  }
  
  /**
   * 释放分布式锁
   * @param key 锁的键名
   * @param owner 锁的所有者
   * @returns 是否成功释放锁
   */
  release(key: string, owner: string): boolean {
    const lock = this.locks.get(key);
    
    if (!lock || lock.owner !== owner) {
      return false;
    }
    
    this.locks.delete(key);
    return true;
  }
  
  /**
   * 清理过期的锁
   */
  cleanup(): void {
    const now = getCurrentTimestamp();
    for (const [key, lock] of this.locks.entries()) {
      if (now > lock.expireTime) {
        this.locks.delete(key);
      }
    }
  }
}

/**
 * 全局分布式锁实例
 */
export const globalDistributedLock = new DistributedLock();

/**
 * 定期清理过期的分布式锁
 */
setInterval(() => {
  globalDistributedLock.cleanup();
}, 30000); // 每30秒清理一次 