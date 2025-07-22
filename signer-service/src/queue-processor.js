const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');
const config = require('./config');
const logger = require('./logger');
const BlockchainService = require('./blockchain');
const StrapiApiService = require('./strapi-api');

class QueueProcessor {
  constructor() {
    this.redis = new IORedis(config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    this.blockchainService = new BlockchainService();
    this.strapiApi = new StrapiApiService();
    
    // 创建队列
    this.withdrawQueue = new Queue('withdraw', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
    
    // 创建Worker
    this.worker = new Worker('withdraw', this.processJob.bind(this), {
      connection: this.redis,
      concurrency: 1, // 一次处理一个任务，确保安全性
    });
    
    this.setupEventHandlers();
    logger.info('Queue processor initialized');
  }
  
  setupEventHandlers() {
    // Worker事件
    this.worker.on('completed', (job, result) => {
      logger.info('Job completed successfully', {
        jobId: job.id,
        jobType: job.data.type,
        result
      });
    });
    
    this.worker.on('failed', (job, err) => {
      logger.error('Job failed', {
        jobId: job.id,
        jobType: job.data.type,
        error: err.message,
        stack: err.stack
      });
    });
    
    this.worker.on('error', (err) => {
      logger.error('Worker error', {
        error: err.message,
        stack: err.stack
      });
    });
    
    // 队列事件
    this.withdrawQueue.on('waiting', (job) => {
      logger.info('Job waiting', {
        jobId: job.id,
        jobType: job.data.type
      });
    });
    
    this.withdrawQueue.on('active', (job) => {
      logger.info('Job started processing', {
        jobId: job.id,
        jobType: job.data.type
      });
    });
  }
  
  async processJob(job) {
    // 修复数据解构问题
    // Strapi发送的数据格式：{ withdrawId, userId, amount, toAddress, priority }
    // 不是 { type, data } 格式
    const jobData = job.data;
    const jobType = job.name; // 从job.name获取任务类型
    
    logger.info('Processing job', {
      jobId: job.id,
      type: jobType,
      data: jobData
    });
    
    try {
      switch (jobType) {
        case 'sign':
          return await this.processSignJob(jobData);
        case 'broadcast':
          return await this.processBroadcastJob(jobData);
        case 'confirm':
          return await this.processConfirmJob(jobData);
        default:
          throw new Error(`Unknown job type: ${jobType}`);
      }
    } catch (error) {
      logger.error('Job processing failed', {
        jobId: job.id,
        type: jobType,
        data: jobData,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  // 处理签名任务
  async processSignJob(data) {
    // 添加数据验证和错误处理
    if (!data) {
      throw new Error('Job data is undefined or null');
    }
    
    // 尝试从不同格式的数据中提取信息
    let withdrawId, userId, amount, toAddress;
    
    if (data.withdrawId) {
      // 标准格式
      ({ withdrawId, userId, amount, toAddress } = data);
    } else if (data.withdrawal_id) {
      // 备用格式
      withdrawId = data.withdrawal_id;
      userId = data.user_id;
      amount = data.amount;
      toAddress = data.wallet_address;
    } else if (data.id) {
      // 从Strapi返回的数据格式
      withdrawId = data.id;
      userId = data.attributes?.yonghu;
      amount = data.attributes?.usdtJine;
      toAddress = data.attributes?.toAddress;
    } else {
      throw new Error('Invalid job data format: missing required fields');
    }
    
    // 验证必需字段
    if (!withdrawId) {
      throw new Error('Missing withdrawId in job data');
    }
    if (!amount) {
      throw new Error('Missing amount in job data');
    }
    if (!toAddress) {
      throw new Error('Missing toAddress in job data');
    }
    
    logger.info('Processing sign job', {
      withdrawId,
      userId,
      amount,
      toAddress
    });
    
    try {
      // 1. 获取提现详情
      const withdrawal = await this.strapiApi.getWithdrawal(withdrawId);
      if (!withdrawal.data) {
        throw new Error(`Withdrawal not found: ${withdrawId}`);
      }
      
      // 2. 验证状态
      if (withdrawal.data.data.zhuangtai !== 'pending') {
        throw new Error(`Invalid withdrawal status: ${withdrawal.data.data.zhuangtai}`);
      }
      
      // 3. 签名交易
      const signedTx = await this.blockchainService.signWithdrawalTransaction(toAddress, amount);
      
      // 4. 添加广播任务到队列
      await this.withdrawQueue.add('broadcast', {
        withdrawId,
        userId,
        amount,
        toAddress,
        signedTx
      }, {
        delay: 1000, // 1秒后执行
        jobId: `withdraw_broadcast_${withdrawId}`
      });
      
      logger.info('Sign job completed, broadcast job queued', {
        withdrawId,
        signedTx
      });
      
      return {
        status: 'signed',
        withdrawId,
        signedTx
      };
    } catch (error) {
      // 处理签名失败
      await this.handleSignFailure(withdrawId, error);
      throw error;
    }
  }
  
  // 处理广播任务
  async processBroadcastJob(data) {
    // 添加数据验证和错误处理
    if (!data) {
      throw new Error('Job data is undefined or null');
    }
    
    // 尝试从不同格式的数据中提取信息
    let withdrawId, userId, amount, toAddress, signedTx;
    
    if (data.withdrawId) {
      // 标准格式
      ({ withdrawId, userId, amount, toAddress, signedTx } = data);
    } else if (data.withdrawal_id) {
      // 备用格式
      withdrawId = data.withdrawal_id;
      userId = data.user_id;
      amount = data.amount;
      toAddress = data.wallet_address;
      signedTx = data.signedTx;
    } else {
      throw new Error('Invalid job data format: missing required fields');
    }
    
    // 验证必需字段
    if (!withdrawId) {
      throw new Error('Missing withdrawId in job data');
    }
    if (!signedTx) {
      throw new Error('Missing signedTx in job data');
    }
    
    logger.info('Processing broadcast job', {
      withdrawId,
      userId,
      amount,
      toAddress
    });
    
    try {
      // 1. 广播交易
      const result = await this.blockchainService.broadcastTransaction(signedTx);
      
      // 2. 更新提现状态为已广播
      await this.strapiApi.updateWithdrawalStatus(withdrawId, 'broadcasted', result.txHash);
      
      // 3. 添加确认任务到队列
      await this.withdrawQueue.add('confirm', {
        withdrawId,
        userId,
        amount,
        toAddress,
        txHash: result.txHash
      }, {
        delay: 30000, // 30秒后检查确认
        jobId: `withdraw_confirm_${withdrawId}`,
        attempts: 10, // 最多重试10次
        backoff: {
          type: 'exponential',
          delay: 60000, // 1分钟后开始重试
        }
      });
      
      logger.info('Broadcast job completed, confirm job queued', {
        withdrawId,
        txHash: result.txHash
      });
      
      return {
        status: 'broadcasted',
        withdrawId,
        txHash: result.txHash
      };
    } catch (error) {
      // 处理广播失败
      await this.handleBroadcastFailure(withdrawId, error);
      throw error;
    }
  }
  
  // 处理确认任务
  async processConfirmJob(data) {
    // 添加数据验证和错误处理
    if (!data) {
      throw new Error('Job data is undefined or null');
    }
    
    // 尝试从不同格式的数据中提取信息
    let withdrawId, userId, amount, toAddress, txHash;
    
    if (data.withdrawId) {
      // 标准格式
      ({ withdrawId, userId, amount, toAddress, txHash } = data);
    } else if (data.withdrawal_id) {
      // 备用格式
      withdrawId = data.withdrawal_id;
      userId = data.user_id;
      amount = data.amount;
      toAddress = data.wallet_address;
      txHash = data.txHash;
    } else {
      throw new Error('Invalid job data format: missing required fields');
    }
    
    // 验证必需字段
    if (!withdrawId) {
      throw new Error('Missing withdrawId in job data');
    }
    if (!txHash) {
      throw new Error('Missing txHash in job data');
    }
    
    logger.info('Processing confirm job', {
      withdrawId,
      userId,
      amount,
      toAddress,
      txHash
    });
    
    try {
      // 1. 检查交易状态
      const txStatus = await this.blockchainService.getTransactionStatus(txHash);
      
      if (txStatus.status === 'pending') {
        // 交易还在等待确认，重新入队
        throw new Error('Transaction still pending, will retry');
      }
      
      if (txStatus.status === 'success') {
        // 交易成功，更新状态
        await this.strapiApi.updateWithdrawalStatus(withdrawId, 'success', txHash);
        
        // 发送Webhook通知
        await this.strapiApi.sendWebhookNotification('withdrawal_success', {
          withdrawId,
          txHash,
          amount,
          toAddress
        });
        
        logger.info('Confirm job completed - success', {
          withdrawId,
          txHash
        });
        
        return {
          status: 'confirmed',
          withdrawId,
          txHash
        };
      } else {
        // 交易失败
        await this.handleTransactionFailure(withdrawId, txHash);
        throw new Error('Transaction failed on blockchain');
      }
    } catch (error) {
      if (error.message === 'Transaction still pending, will retry') {
        throw error; // 重新抛出，让BullMQ重试
      }
      
      // 其他错误，处理失败
      await this.handleConfirmFailure(withdrawId, error);
      throw error;
    }
  }
  
  // 处理签名失败
  async handleSignFailure(withdrawId, error) {
    logger.error('Handling sign failure', { withdrawId, error: error.message });
    
    try {
      await this.strapiApi.updateWithdrawalStatus(withdrawId, 'failed');
      await this.strapiApi.handleWithdrawalFailure(withdrawId);
    } catch (apiError) {
      logger.error('Failed to handle sign failure in API', { withdrawId, error: apiError.message });
    }
  }
  
  // 处理广播失败
  async handleBroadcastFailure(withdrawId, error) {
    logger.error('Handling broadcast failure', { withdrawId, error: error.message });
    
    try {
      await this.strapiApi.updateWithdrawalStatus(withdrawId, 'failed');
      await this.strapiApi.handleWithdrawalFailure(withdrawId);
    } catch (apiError) {
      logger.error('Failed to handle broadcast failure in API', { withdrawId, error: apiError.message });
    }
  }
  
  // 处理交易失败
  async handleTransactionFailure(withdrawId, txHash) {
    logger.error('Handling transaction failure', { withdrawId, txHash });
    
    try {
      await this.strapiApi.updateWithdrawalStatus(withdrawId, 'failed', txHash);
      await this.strapiApi.handleWithdrawalFailure(withdrawId);
    } catch (apiError) {
      logger.error('Failed to handle transaction failure in API', { withdrawId, error: apiError.message });
    }
  }
  
  // 处理确认失败
  async handleConfirmFailure(withdrawId, error) {
    logger.error('Handling confirm failure', { withdrawId, error: error.message });
    
    try {
      await this.strapiApi.updateWithdrawalStatus(withdrawId, 'failed');
      await this.strapiApi.handleWithdrawalFailure(withdrawId);
    } catch (apiError) {
      logger.error('Failed to handle confirm failure in API', { withdrawId, error: apiError.message });
    }
  }
  
  // 获取队列状态
  async getQueueStatus() {
    try {
      const waiting = await this.withdrawQueue.getWaiting();
      const active = await this.withdrawQueue.getActive();
      const completed = await this.withdrawQueue.getCompleted();
      const failed = await this.withdrawQueue.getFailed();
      
      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      logger.error('Failed to get queue status', { error: error.message });
      throw error;
    }
  }
  
  // 清理队列
  async cleanQueue() {
    try {
      await this.withdrawQueue.clean(1000 * 60 * 60 * 24, 'completed'); // 清理24小时前的完成任务
      await this.withdrawQueue.clean(1000 * 60 * 60 * 24, 'failed');     // 清理24小时前的失败任务
      logger.info('Queue cleaned successfully');
    } catch (error) {
      logger.error('Failed to clean queue', { error: error.message });
      throw error;
    }
  }
  
  // 关闭服务
  async close() {
    try {
      await this.worker.close();
      await this.withdrawQueue.close();
      await this.redis.quit();
      logger.info('Queue processor closed successfully');
    } catch (error) {
      logger.error('Failed to close queue processor', { error: error.message });
      throw error;
    }
  }
}

module.exports = QueueProcessor; 