import { Job } from 'bullmq';
import { withdrawQueue } from './index';

// 提现任务数据类型
export interface WithdrawJobData {
  withdrawId: number;
  userId: number;
  amount: number;
  toAddress: string;
  priority?: 'low' | 'normal' | 'high';
}

// 提现任务类型
export type WithdrawJobType = 'sign' | 'broadcast' | 'confirm';

// 添加提现签名任务
export async function addWithdrawSignJob(data: WithdrawJobData) {
  try {
    const job = await withdrawQueue.add('sign', data, {
      priority: data.priority === 'high' ? 1 : data.priority === 'low' ? 3 : 2,
      delay: 0, // 立即执行
      jobId: `withdraw_sign_${data.withdrawId}`,
    });
    
    console.log(`📋 提现签名任务已添加: ${job.id}, 提现ID: ${data.withdrawId}`);
    return job;
  } catch (error) {
    console.error('❌ 添加提现签名任务失败:', error);
    throw error;
  }
}

// 添加提现广播任务
export async function addWithdrawBroadcastJob(data: WithdrawJobData & { txHash: string }) {
  try {
    const job = await withdrawQueue.add('broadcast', data, {
      priority: 1, // 高优先级
      delay: 0,
      jobId: `withdraw_broadcast_${data.withdrawId}`,
    });
    
    console.log(`📋 提现广播任务已添加: ${job.id}, 提现ID: ${data.withdrawId}`);
    return job;
  } catch (error) {
    console.error('❌ 添加提现广播任务失败:', error);
    throw error;
  }
}

// 添加提现确认任务
export async function addWithdrawConfirmJob(data: WithdrawJobData & { txHash: string }) {
  try {
    const job = await withdrawQueue.add('confirm', data, {
      priority: 2,
      delay: 5000, // 5秒后执行，等待链上确认
      jobId: `withdraw_confirm_${data.withdrawId}`,
    });
    
    console.log(`📋 提现确认任务已添加: ${job.id}, 提现ID: ${data.withdrawId}`);
    return job;
  } catch (error) {
    console.error('❌ 添加提现确认任务失败:', error);
    throw error;
  }
}

// 获取队列状态
export async function getQueueStatus() {
  try {
    const waiting = await withdrawQueue.getWaiting();
    const active = await withdrawQueue.getActive();
    const completed = await withdrawQueue.getCompleted();
    const failed = await withdrawQueue.getFailed();
    
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  } catch (error) {
    console.error('❌ 获取队列状态失败:', error);
    throw error;
  }
}

// 清理队列
export async function cleanQueue() {
  try {
    await withdrawQueue.clean(1000 * 60 * 60 * 24, 'completed' as any); // 清理24小时前的完成任务
    await withdrawQueue.clean(1000 * 60 * 60 * 24, 'failed' as any);     // 清理24小时前的失败任务
    console.log('🧹 队列清理完成');
  } catch (error) {
    console.error('❌ 队列清理失败:', error);
    throw error;
  }
}

// 暂停队列
export async function pauseQueue() {
  try {
    await withdrawQueue.pause();
    console.log('⏸️ 提现队列已暂停');
  } catch (error) {
    console.error('❌ 暂停队列失败:', error);
    throw error;
  }
}

// 恢复队列
export async function resumeQueue() {
  try {
    await withdrawQueue.resume();
    console.log('▶️ 提现队列已恢复');
  } catch (error) {
    console.error('❌ 恢复队列失败:', error);
    throw error;
  }
} 