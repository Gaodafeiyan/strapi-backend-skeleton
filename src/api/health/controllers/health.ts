import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::health.health' as any, ({ strapi }) => ({
  /**
   * 系统健康检查
   */
  async check(ctx) {
    try {
      const startTime = Date.now();
      
      // 检查数据库连接
      let dbStatus = 'unknown';
      try {
        await strapi.db.connection.raw('SELECT 1');
        dbStatus = 'healthy';
      } catch (error) {
        dbStatus = 'unhealthy';
        console.error('数据库连接检查失败:', error);
      }

      // 检查Redis连接（如果配置了）
      let redisStatus = 'not_configured';
      try {
        if ((strapi as any).redis) {
          await (strapi as any).redis.ping();
          redisStatus = 'healthy';
        }
      } catch (error) {
        redisStatus = 'unhealthy';
        console.error('Redis连接检查失败:', error);
      }

      // 检查关键服务
      const services = {
        database: dbStatus,
        redis: redisStatus,
        cache: redisStatus === 'healthy' ? 'available' : 'unavailable'
      };

      // 检查系统资源
      const systemInfo = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      };

      // 检查业务数据
      const businessMetrics = await this.getBusinessMetrics();

      const responseTime = Date.now() - startTime;
      
      const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded';

      ctx.send({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        services,
        system: systemInfo,
        business: businessMetrics
      });

    } catch (error) {
      console.error('健康检查失败:', error);
      ctx.status = 500;
      ctx.body = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  },

  /**
   * 获取业务指标
   */
  async getBusinessMetrics() {
    try {
      const [
        userCount,
        orderCount,
        walletCount,
        rewardCount,
        choujiangCount
      ] = await Promise.all([
        strapi.db.query('plugin::users-permissions.user').count(),
        strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').count(),
        strapi.db.query('api::qianbao-yue.qianbao-yue').count(),
        strapi.db.query('api::yaoqing-jiangli.yaoqing-jiangli').count(),
        strapi.db.query('api::choujiang-ji-lu.choujiang-ji-lu').count()
      ]);

      return {
        users: userCount,
        orders: orderCount,
        wallets: walletCount,
        rewards: rewardCount,
        choujiangRecords: choujiangCount
      };
    } catch (error) {
      console.error('获取业务指标失败:', error);
      return { error: '获取业务指标失败' };
    }
  },

  /**
   * 详细健康检查
   */
  async detailed(ctx) {
    try {
      const checks = {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        services: await this.checkServices(),
        endpoints: await this.checkEndpoints()
      };

      const allHealthy = Object.values(checks).every((check: any) => check.status === 'healthy');

      ctx.send({
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        checks
      });

    } catch (error) {
      console.error('详细健康检查失败:', error);
      ctx.status = 500;
      ctx.body = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  },

  /**
   * 检查数据库
   */
  async checkDatabase() {
    const startTime = Date.now();
    try {
      await strapi.db.connection.raw('SELECT 1');
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: '数据库连接正常'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  },

  /**
   * 检查Redis
   */
  async checkRedis() {
    const startTime = Date.now();
    try {
      if (!(strapi as any).redis) {
        return {
          status: 'not_configured',
          responseTime: Date.now() - startTime,
          details: 'Redis未配置'
        };
      }
      
      await (strapi as any).redis.ping();
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: 'Redis连接正常'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  },

  /**
   * 检查服务
   */
  async checkServices() {
    const services: any = {};
    
    try {
      // 检查钱包服务
      const walletService = strapi.service('api::qianbao-yue.qianbao-yue');
      if (walletService) {
        services.wallet = { status: 'available' };
      } else {
        services.wallet = { status: 'unavailable' };
      }

      // 检查订单服务
      const orderService = strapi.service('api::dinggou-dingdan.dinggou-dingdan');
      if (orderService) {
        services.order = { status: 'available' };
      } else {
        services.order = { status: 'unavailable' };
      }

      // 检查邀请奖励服务
      const rewardService = strapi.service('api::yaoqing-jiangli.yaoqing-jiangli');
      if (rewardService) {
        services.reward = { status: 'available' };
      } else {
        services.reward = { status: 'unavailable' };
      }

    } catch (error) {
      services.error = error.message;
    }

    return services;
  },

  /**
   * 检查端点
   */
  async checkEndpoints() {
    const endpoints: any = {};
    
    try {
      // 这里可以添加关键API端点的检查
      endpoints.api = { status: 'available' };
    } catch (error) {
      endpoints.api = { status: 'unavailable', error: error.message };
    }

    return endpoints;
  }
})); 