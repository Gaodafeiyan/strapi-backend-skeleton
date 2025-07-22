import IORedis from 'ioredis';
import { Queue } from 'bullmq';

// Redis连接配置
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

// 连接事件监听
connection.on('connect', () => {
  console.log('✅ Redis连接成功');
});

connection.on('error', (error) => {
  console.error('❌ Redis连接错误:', error);
});

connection.on('close', () => {
  console.log('🔌 Redis连接关闭');
});

// 导出连接实例
export { connection };

// 队列配置
export const queueConfig = {
  defaultJobOptions: {
    removeOnComplete: 100, // 保留最近100个完成的任务
    removeOnFail: 50,      // 保留最近50个失败的任务
    attempts: 3,           // 最大重试次数
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

// 创建队列实例
export const withdrawQueue = new Queue('withdraw', { 
  connection,
  defaultJobOptions: queueConfig.defaultJobOptions,
});

// 队列事件监听
withdrawQueue.on('waiting', (job) => {
  console.log(`📋 提现任务等待中: ${job.id}`);
}); 