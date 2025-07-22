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
    const { type, data } = job.data;
    
    logger.info('Processing job', {
      jobId: job.id,
      type,
      data
    });
    
    try {
      switch (type) {
        case 'sign':
          return await this.processSignJob(data);
        case 'broadcast':
          return await this.processBroadcastJob(data);
        case 'confirm':
          return await this.processConfirmJob(data);
        default:
          throw new Error(`Unknown job type: ${type}`);
      }
    } catch (error) {
      logger.error('Job processing failed', {
        jobId: job.id,
        type,
        data,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  // 处理签名任务
  async processSignJob(data) {
    const { withdrawId, userId, amount, toAddress } = data;
    
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
      if (withdrawal.data.attributes.zhuangtai !== 'pending') {
        throw new Error(`Invalid withdrawal status: ${withdrawal.data.attributes.zhuangtai}`);
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
    const { withdrawId, userId, amount, toAddress, signedTx } = data;
    
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
    const { withdrawId, userId, amount, toAddress, txHash } = data;
    
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