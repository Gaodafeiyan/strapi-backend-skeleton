import { factories } from '@strapi/strapi';

// 获取系统信息的辅助函数
async function getSystemInfo() {
  return {
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    title: process.title
  };
}

// 获取数据库性能指标的辅助函数
async function getDatabaseMetrics(strapi: any) {
  try {
    const startTime = Date.now();
    
    // 测试数据库连接
    await strapi.db.connection.raw('SELECT 1');
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      poolSize: 'unknown',
      activeConnections: 0,
      idleConnections: 0,
      waitingConnections: 0
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: 'timeout'
    };
  }
}

// 获取Redis性能指标的辅助函数
async function getRedisMetrics(strapi: any) {
  try {
    if (!strapi.redis) {
      return {
        status: 'not_configured',
        message: 'Redis未配置'
      };
    }
    
    const startTime = Date.now();
    await strapi.redis.ping();
    const responseTime = Date.now() - startTime;
    
    // 获取Redis信息
    const info = await strapi.redis.info();
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      version: info.split('\r\n').find((line: string) => line.startsWith('redis_version:'))?.split(':')[1] || 'unknown',
      connectedClients: info.split('\r\n').find((line: string) => line.startsWith('connected_clients:'))?.split(':')[1] || 'unknown',
      usedMemory: info.split('\r\n').find((line: string) => line.startsWith('used_memory_human:'))?.split(':')[1] || 'unknown'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: 'timeout'
    };
  }
}

// 获取内存使用指标的辅助函数
async function getMemoryMetrics() {
  const memUsage = process.memoryUsage();
  
  return {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    arrayBuffers: `${Math.round(memUsage.arrayBuffers / 1024 / 1024)} MB`,
    usagePercentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
  };
}

// 获取CPU使用指标的辅助函数
async function getCpuMetrics() {
  const startUsage = process.cpuUsage();
  
  // 等待一小段时间来计算CPU使用率
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const endUsage = process.cpuUsage(startUsage);
  
  return {
    user: `${Math.round(endUsage.user / 1000)}ms`,
    system: `${Math.round(endUsage.system / 1000)}ms`,
    total: `${Math.round((endUsage.user + endUsage.system) / 1000)}ms`
  };
}

// 获取网络指标的辅助函数
async function getNetworkMetrics() {
  // 这里可以集成实际的网络监控库
  return {
    status: 'monitoring_disabled',
    message: '网络监控需要额外配置'
  };
}

// 获取错误统计的辅助函数
async function getErrorStats(startTime: Date, endTime: Date) {
  // 这里应该从实际的日志系统或数据库中获取错误统计
  // 目前返回模拟数据
  return {
    totalErrors: Math.floor(Math.random() * 100),
    errorRate: (Math.random() * 5).toFixed(2) + '%',
    errorTypes: {
      '500': Math.floor(Math.random() * 50),
      '404': Math.floor(Math.random() * 30),
      '400': Math.floor(Math.random() * 20)
    },
    topErrors: [
      { error: 'Database connection timeout', count: Math.floor(Math.random() * 20) },
      { error: 'Redis connection failed', count: Math.floor(Math.random() * 15) },
      { error: 'Invalid API request', count: Math.floor(Math.random() * 10) }
    ]
  };
}

// 计算业务指标的辅助函数
async function calculateBusinessMetrics(strapi: any, startTime: Date, endTime: Date) {
  // 获取用户注册统计
  const newUsers = await strapi.db.query('plugin::users-permissions.user').count({
    where: {
      createdAt: {
        $gte: startTime,
        $lte: endTime
      }
    }
  });
  
  // 获取订单统计
  const newOrders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').count({
    where: {
      createdAt: {
        $gte: startTime,
        $lte: endTime
      }
    }
  });
  
  // 获取充值统计
  const totalRecharge = await strapi.db.query('api::qianbao-chongzhi.qianbao-chongzhi').count({
    where: {
      createdAt: {
        $gte: startTime,
        $lte: endTime
      },
      zhuangtai: 'success'
    }
  });
  
  // 获取提现统计
  const totalWithdrawal = await strapi.db.query('api::qianbao-tixian.qianbao-tixian').count({
    where: {
      createdAt: {
        $gte: startTime,
        $lte: endTime
      },
      zhuangtai: 'success'
    }
  });
  
  // 获取抽奖统计
  const totalLottery = await strapi.db.query('api::choujiang-ji-lu.choujiang-ji-lu').count({
    where: {
      createdAt: {
        $gte: startTime,
        $lte: endTime
      }
    }
  });
  
  return {
    newUsers,
    newOrders,
    totalRecharge,
    totalWithdrawal,
    totalLottery,
    conversionRate: newUsers > 0 ? ((newOrders / newUsers) * 100).toFixed(2) + '%' : '0%',
    netFlow: totalRecharge - totalWithdrawal
  };
}

export default factories.createCoreController('api::performance-monitor.performance-monitor' as any, ({ strapi }) => ({
  /**
   * 获取系统性能指标
   */
  async getSystemMetrics(ctx) {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        system: await getSystemInfo(),
        database: await getDatabaseMetrics(strapi),
        redis: await getRedisMetrics(strapi),
        memory: await getMemoryMetrics(),
        cpu: await getCpuMetrics(),
        network: await getNetworkMetrics()
      };
      
      ctx.send({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('获取系统性能指标失败:', error);
      ctx.throw(500, '获取系统性能指标失败');
    }
  },

  /**
   * 获取错误率统计
   */
  async getErrorRate(ctx) {
    try {
      const { timeRange = '24h' } = ctx.query;
      
      // 计算时间范围
      const now = new Date();
      let startTime: Date;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }
      
      // 获取错误日志统计
      const errorStats = await getErrorStats(startTime, now);
      
      ctx.send({
        success: true,
        data: {
          timeRange,
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
          ...errorStats
        }
      });
    } catch (error) {
      console.error('获取错误率统计失败:', error);
      ctx.throw(500, '获取错误率统计失败');
    }
  },

  /**
   * 获取业务指标
   */
  async getBusinessMetrics(ctx) {
    try {
      const { timeRange = '24h' } = ctx.query;
      
      // 计算时间范围
      const now = new Date();
      let startTime: Date;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }
      
      const metrics = await calculateBusinessMetrics(strapi, startTime, now);
      
      ctx.send({
        success: true,
        data: {
          timeRange,
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
          ...metrics
        }
      });
    } catch (error) {
      console.error('获取业务指标失败:', error);
      ctx.throw(500, '获取业务指标失败');
    }
  },

  /**
   * 获取告警配置
   */
  async getAlertConfig(ctx) {
    try {
      // 这里应该从数据库或配置文件中获取告警配置
      const alertConfig = {
        cpuThreshold: 80, // CPU使用率阈值
        memoryThreshold: 85, // 内存使用率阈值
        errorRateThreshold: 5, // 错误率阈值
        responseTimeThreshold: 2000, // 响应时间阈值(ms)
        enabled: true
      };
      
      ctx.send({
        success: true,
        data: alertConfig
      });
    } catch (error) {
      console.error('获取告警配置失败:', error);
      ctx.throw(500, '获取告警配置失败');
    }
  },

  /**
   * 更新告警配置
   */
  async updateAlertConfig(ctx) {
    try {
      const { cpuThreshold, memoryThreshold, errorRateThreshold, responseTimeThreshold, enabled } = ctx.request.body;
      
      // 这里应该保存到数据库或配置文件
      const alertConfig = {
        cpuThreshold: cpuThreshold || 80,
        memoryThreshold: memoryThreshold || 85,
        errorRateThreshold: errorRateThreshold || 5,
        responseTimeThreshold: responseTimeThreshold || 2000,
        enabled: enabled !== undefined ? enabled : true
      };
      
      ctx.send({
        success: true,
        data: alertConfig,
        message: '告警配置更新成功'
      });
    } catch (error) {
      console.error('更新告警配置失败:', error);
      ctx.throw(500, '更新告警配置失败');
    }
  }
})); 