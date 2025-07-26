import { factories } from '@strapi/strapi';

// 获取用户统计的辅助函数
async function getUserStats(strapi: any) {
  const totalUsers = await strapi.db.query('plugin::users-permissions.user').count();
  const todayUsers = await strapi.db.query('plugin::users-permissions.user').count({
    where: {
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });
  
  const activeUsers = await strapi.db.query('plugin::users-permissions.user').count({
    where: {
      lastLogin: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天内
      }
    }
  });

  return {
    totalUsers,
    todayUsers,
    activeUsers,
    growthRate: totalUsers > 0 ? ((todayUsers / totalUsers) * 100).toFixed(2) : '0'
  };
}

// 获取订单统计的辅助函数
async function getOrderStats(strapi: any) {
  const totalOrders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').count();
  const todayOrders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').count({
    where: {
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });
  
  const pendingOrders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').count({
    where: { status: 'pending' }
  });
  
  const runningOrders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').count({
    where: { status: 'running' }
  });

  return {
    totalOrders,
    todayOrders,
    pendingOrders,
    runningOrders,
    completionRate: totalOrders > 0 ? (((totalOrders - pendingOrders - runningOrders) / totalOrders) * 100).toFixed(2) : '0'
  };
}

// 获取财务统计的辅助函数
async function getFinancialStats(strapi: any) {
  // 获取钱包余额总和
  const wallets = await strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
    select: ['usdtYue', 'aiYue']
  });
  
  const totalUsdtBalance = wallets.reduce((sum, wallet) => sum + (parseFloat(wallet.usdtYue || '0')), 0);
  const totalAiBalance = wallets.reduce((sum, wallet) => sum + (parseFloat(wallet.aiYue || '0')), 0);
  
  // 获取今日充值
  const todayRecharges = await strapi.db.query('api::qianbao-chongzhi.qianbao-chongzhi').count({
    where: {
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      },
      status: 'success'
    }
  });
  
  // 获取今日提现
  const todayWithdrawals = await strapi.db.query('api::qianbao-tixian.qianbao-tixian').count({
    where: {
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      },
      status: 'success'
    }
  });

  return {
    totalUsdtBalance: totalUsdtBalance.toFixed(2),
    totalAiBalance: totalAiBalance.toFixed(8),
    todayRecharges,
    todayWithdrawals,
    netFlow: (todayRecharges - todayWithdrawals).toFixed(2)
  };
}

// 获取性能统计的辅助函数
async function getPerformanceStats(strapi: any) {
  const systemInfo = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform
  };
  
  // 获取数据库连接状态
  let dbStatus = 'unknown';
  try {
    await strapi.db.connection.raw('SELECT 1');
    dbStatus = 'healthy';
  } catch (error) {
    dbStatus = 'unhealthy';
  }
  
  // 获取Redis状态
  let redisStatus = 'not_configured';
  try {
    if (strapi.redis) {
      await strapi.redis.ping();
      redisStatus = 'healthy';
    }
  } catch (error) {
    redisStatus = 'unhealthy';
  }

  return {
    systemInfo,
    dbStatus,
    redisStatus,
    timestamp: new Date().toISOString()
  };
}

// 获取最近活动的辅助函数
async function getRecentActivities(strapi: any) {
  const activities = [];
  
  // 最近注册的用户
  const recentUsers = await strapi.db.query('plugin::users-permissions.user').findMany({
    select: ['id', 'username', 'email', 'createdAt'],
    orderBy: { createdAt: 'desc' },
    limit: 5
  });
  
  activities.push(...recentUsers.map(user => ({
    type: 'user_registration',
    title: '新用户注册',
    description: `用户 ${user.username} 注册`,
    timestamp: user.createdAt,
    data: user
  })));
  
  // 最近的订单
  const recentOrders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').findMany({
    select: ['id', 'benjinUSDT', 'status', 'createdAt'],
    populate: ['yonghu'],
    orderBy: { createdAt: 'desc' },
    limit: 5
  });
  
  activities.push(...recentOrders.map(order => ({
    type: 'order_created',
    title: '新投资订单',
    description: `用户 ${order.yonghu?.username || '未知'} 创建订单 ${order.benjinUSDT} USDT`,
    timestamp: order.createdAt,
    data: order
  })));
  
  // 最近的抽奖
  const recentLotteries = await strapi.db.query('api::choujiang-ji-lu.choujiang-ji-lu').findMany({
    select: ['id', 'jiangPinMingCheng', 'jiangPinJinE', 'createdAt'],
    populate: ['yonghu'],
    orderBy: { createdAt: 'desc' },
    limit: 5
  });
  
  activities.push(...recentLotteries.map(lottery => ({
    type: 'lottery_win',
    title: '抽奖中奖',
    description: `用户 ${lottery.yonghu?.username || '未知'} 获得 ${lottery.jiangPinMingCheng}`,
    timestamp: lottery.createdAt,
    data: lottery
  })));
  
  // 按时间排序
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return activities.slice(0, 10);
}

export default factories.createCoreController('api::admin-dashboard.admin-dashboard' as any, ({ strapi }) => ({
  /**
   * 获取系统概览数据
   */
  async getSystemOverview(ctx) {
    try {
      const startTime = Date.now();
      
      // 获取用户统计
      const userStats = await getUserStats(strapi);
      
      // 获取订单统计
      const orderStats = await getOrderStats(strapi);
      
      // 获取财务统计
      const financialStats = await getFinancialStats(strapi);
      
      // 获取系统性能统计
      const performanceStats = await getPerformanceStats(strapi);
      
      // 获取最近活动
      const recentActivities = await getRecentActivities(strapi);
      
      const responseTime = Date.now() - startTime;
      
      ctx.body = {
        success: true,
        data: {
          userStats,
          orderStats,
          financialStats,
          performanceStats,
          recentActivities,
          responseTime: `${responseTime}ms`
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * 获取用户管理数据
   */
  async getUserManagement(ctx) {
    try {
      const { page = 1, pageSize = 20, search = '', status = '' } = ctx.query;
      
      const filters: any = {};
      
      if (search) {
        filters.$or = [
          { username: { $containsi: search } },
          { email: { $containsi: search } }
        ];
      }
      
      if (status) {
        filters.status = status;
      }
      
      const users = await strapi.db.query('plugin::users-permissions.user').findMany({
        where: filters,
        select: ['id', 'username', 'email', 'status', 'createdAt', 'lastLogin'],
        populate: ['qianbao_yue'],
        orderBy: { createdAt: 'desc' },
        limit: parseInt(pageSize as string),
        offset: (parseInt(page as string) - 1) * parseInt(pageSize as string)
      });
      
      const total = await strapi.db.query('plugin::users-permissions.user').count({
        where: filters
      });
      
      ctx.body = {
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            total,
            totalPages: Math.ceil(total / parseInt(pageSize as string))
          }
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * 获取订单管理数据
   */
  async getOrderManagement(ctx) {
    try {
      const { page = 1, pageSize = 20, status = '', userId = '' } = ctx.query;
      
      const filters: any = {};
      
      if (status) {
        filters.status = status;
      }
      
      if (userId) {
        filters.yonghu = userId;
      }
      
      const orders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').findMany({
        where: filters,
        select: ['id', 'benjinUSDT', 'status', 'createdAt', 'jingtaiShouyi', 'aiShuliang'],
        populate: ['yonghu', 'jihua'],
        orderBy: { createdAt: 'desc' },
        limit: parseInt(pageSize as string),
        offset: (parseInt(page as string) - 1) * parseInt(pageSize as string)
      });
      
      const total = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').count({
        where: filters
      });
      
      ctx.body = {
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            total,
            totalPages: Math.ceil(total / parseInt(pageSize as string))
          }
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 