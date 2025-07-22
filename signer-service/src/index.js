const express = require('express');
const config = require('./config');
const logger = require('./logger');
const QueueProcessor = require('./queue-processor');

class SignerService {
  constructor() {
    this.app = express();
    this.queueProcessor = null;
    this.server = null;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // 请求日志
    this.app.use((req, res, next) => {
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }
  
  setupRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'withdraw-signer',
        version: '1.0.0'
      });
    });
    
    // 队列状态
    this.app.get('/api/queue/status', async (req, res) => {
      try {
        if (!this.queueProcessor) {
          return res.status(503).json({
            error: 'Queue processor not initialized'
          });
        }
        
        const status = await this.queueProcessor.getQueueStatus();
        res.json({
          success: true,
          data: status,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to get queue status', { error: error.message });
        res.status(500).json({
          error: 'Failed to get queue status',
          message: error.message
        });
      }
    });
    
    // 清理队列
    this.app.post('/api/queue/clean', async (req, res) => {
      try {
        if (!this.queueProcessor) {
          return res.status(503).json({
            error: 'Queue processor not initialized'
          });
        }
        
        await this.queueProcessor.cleanQueue();
        res.json({
          success: true,
          message: 'Queue cleaned successfully',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to clean queue', { error: error.message });
        res.status(500).json({
          error: 'Failed to clean queue',
          message: error.message
        });
      }
    });
    
    // 手动处理提现
    this.app.post('/api/withdrawal/process', async (req, res) => {
      try {
        const { withdrawId } = req.body;
        
        if (!withdrawId) {
          return res.status(400).json({
            error: 'withdrawId is required'
          });
        }
        
        if (!this.queueProcessor) {
          return res.status(503).json({
            error: 'Queue processor not initialized'
          });
        }
        
        // 添加签名任务到队列
        await this.queueProcessor.withdrawQueue.add('sign', {
          withdrawId: parseInt(withdrawId),
          userId: 1, // 从API获取
          amount: 25, // 从API获取
          toAddress: '0x1234567890123456789012345678901234567890' // 从API获取
        }, {
          jobId: `manual_withdraw_sign_${withdrawId}`
        });
        
        res.json({
          success: true,
          message: 'Withdrawal processing started',
          withdrawId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to process withdrawal', { error: error.message });
        res.status(500).json({
          error: 'Failed to process withdrawal',
          message: error.message
        });
      }
    });
    
    // 获取服务信息
    this.app.get('/api/info', (req, res) => {
      res.json({
        service: 'withdraw-signer',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        config: {
          redis: config.redis.url,
          blockchain: {
            rpcUrl: config.blockchain.rpcUrl,
            usdtContract: config.blockchain.usdtContractAddress,
            walletAddress: config.blockchain.hotWalletAddress ? 'configured' : 'not configured'
          },
          strapi: {
            apiUrl: config.strapi.apiUrl
          }
        },
        timestamp: new Date().toISOString()
      });
    });
  }
  
  setupErrorHandling() {
    // 404处理
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`
      });
    });
    
    // 错误处理
    this.app.use((error, req, res, next) => {
      logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
      });
    });
  }
  
  async start() {
    try {
      // 初始化队列处理器
      logger.info('Initializing queue processor...');
      this.queueProcessor = new QueueProcessor();
      
      // 启动HTTP服务器
      const port = config.service.port;
      this.server = this.app.listen(port, () => {
        logger.info('Signer service started successfully', {
          port,
          environment: process.env.NODE_ENV || 'development'
        });
        
        console.log(`🚀 Signer Service running on port ${port}`);
        console.log(`📊 Health check: http://localhost:${port}/health`);
        console.log(`📋 Queue status: http://localhost:${port}/api/queue/status`);
        console.log(`ℹ️  Service info: http://localhost:${port}/api/info`);
      });
      
      // 优雅关闭处理
      this.setupGracefulShutdown();
      
    } catch (error) {
      logger.error('Failed to start signer service', { error: error.message, stack: error.stack });
      process.exit(1);
    }
  }
  
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      try {
        // 关闭HTTP服务器
        if (this.server) {
          await new Promise((resolve) => {
            this.server.close(resolve);
          });
          logger.info('HTTP server closed');
        }
        
        // 关闭队列处理器
        if (this.queueProcessor) {
          await this.queueProcessor.close();
          logger.info('Queue processor closed');
        }
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
      }
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      shutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
      shutdown('unhandledRejection');
    });
  }
}

// 启动服务
if (require.main === module) {
  const service = new SignerService();
  service.start().catch((error) => {
    logger.error('Failed to start service', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

module.exports = SignerService; 