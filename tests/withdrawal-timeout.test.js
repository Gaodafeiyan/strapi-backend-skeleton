const withdrawalTimeoutJob = require('../src/crons/withdrawal-timeout');

describe('Withdrawal Timeout Job Tests', () => {
  let strapi;
  let testUser;
  let testWithdrawals;

  beforeAll(async () => {
    strapi = await require('@strapi/strapi').Strapi().load();
    
    // 创建测试用户
    testUser = await strapi.entityService.create('plugin::users-permissions.user', {
      data: {
        username: 'timeouttestuser',
        email: 'timeouttest@example.com',
        password: 'password123',
        confirmed: true,
        blocked: false,
        yaoqingMa: 'TIMEOUT123'
      }
    });

    // 创建测试用户钱包
    await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
      data: {
        yonghu: testUser.id,
        usdtYue: '500.00',
        aiYue: '0.00000000'
      }
    });
  });

  afterAll(async () => {
    // 清理测试数据
    if (testWithdrawals) {
      for (const withdrawal of testWithdrawals) {
        await strapi.entityService.delete('api::qianbao-tixian.qianbao-tixian', withdrawal.id);
      }
    }
    if (testUser) {
      await strapi.entityService.delete('plugin::users-permissions.user', testUser.id);
    }
    await strapi.destroy();
  });

  beforeEach(async () => {
    testWithdrawals = [];
  });

  test('应该处理超时提现并返还余额', async () => {
    // 创建30分钟前的broadcasted提现记录
    const thirtyMinutesAgo = new Date(Date.now() - 31 * 60 * 1000); // 31分钟前
    
    const timeoutWithdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
      data: {
        txHash: 'timeout_tx_123',
        usdtJine: 100,
        zhuangtai: 'broadcasted',
        toAddress: '0x123456789',
        yonghu: testUser.id,
        updatedAt: thirtyMinutesAgo
      }
    });

    testWithdrawals.push(timeoutWithdrawal);

    // 执行超时检查任务
    const result = await withdrawalTimeoutJob.handler({ strapi });

    expect(result.success).toBe(true);
    expect(result.totalFound).toBe(1);
    expect(result.processedCount).toBe(1);

    // 验证提现状态已更新为失败
    const updatedWithdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', timeoutWithdrawal.id);
    expect(updatedWithdrawal.zhuangtai).toBe('failed');

    // 验证用户余额已返还
    const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
      filters: { yonghu: { id: testUser.id } }
    });
    expect(wallets[0].usdtYue).toBe('600.00'); // 500 + 100 (返还)
  });

  test('应该忽略未超时的提现记录', async () => {
    // 创建10分钟前的broadcasted提现记录（未超时）
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const notTimeoutWithdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
      data: {
        txHash: 'not_timeout_tx_456',
        usdtJine: 50,
        zhuangtai: 'broadcasted',
        toAddress: '0x987654321',
        yonghu: testUser.id,
        updatedAt: tenMinutesAgo
      }
    });

    testWithdrawals.push(notTimeoutWithdrawal);

    // 执行超时检查任务
    const result = await withdrawalTimeoutJob.handler({ strapi });

    expect(result.success).toBe(true);
    expect(result.totalFound).toBe(0);
    expect(result.processedCount).toBe(0);

    // 验证提现状态未变化
    const updatedWithdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', notTimeoutWithdrawal.id);
    expect(updatedWithdrawal.zhuangtai).toBe('broadcasted');

    // 验证用户余额未变化
    const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
      filters: { yonghu: { id: testUser.id } }
    });
    expect(wallets[0].usdtYue).toBe('500.00');
  });

  test('应该忽略非broadcasted状态的提现记录', async () => {
    // 创建30分钟前的pending提现记录
    const thirtyMinutesAgo = new Date(Date.now() - 31 * 60 * 1000);
    
    const pendingWithdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
      data: {
        txHash: 'pending_tx_789',
        usdtJine: 75,
        zhuangtai: 'pending',
        toAddress: '0x111111111',
        yonghu: testUser.id,
        updatedAt: thirtyMinutesAgo
      }
    });

    testWithdrawals.push(pendingWithdrawal);

    // 执行超时检查任务
    const result = await withdrawalTimeoutJob.handler({ strapi });

    expect(result.success).toBe(true);
    expect(result.totalFound).toBe(0);
    expect(result.processedCount).toBe(0);

    // 验证提现状态未变化
    const updatedWithdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', pendingWithdrawal.id);
    expect(updatedWithdrawal.zhuangtai).toBe('pending');
  });

  test('应该处理多个超时提现记录', async () => {
    // 创建多个30分钟前的broadcasted提现记录
    const thirtyMinutesAgo = new Date(Date.now() - 31 * 60 * 1000);
    
    const withdrawal1 = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
      data: {
        txHash: 'timeout_tx_001',
        usdtJine: 25,
        zhuangtai: 'broadcasted',
        toAddress: '0x111111111',
        yonghu: testUser.id,
        updatedAt: thirtyMinutesAgo
      }
    });

    const withdrawal2 = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
      data: {
        txHash: 'timeout_tx_002',
        usdtJine: 35,
        zhuangtai: 'broadcasted',
        toAddress: '0x222222222',
        yonghu: testUser.id,
        updatedAt: thirtyMinutesAgo
      }
    });

    testWithdrawals.push(withdrawal1, withdrawal2);

    // 执行超时检查任务
    const result = await withdrawalTimeoutJob.handler({ strapi });

    expect(result.success).toBe(true);
    expect(result.totalFound).toBe(2);
    expect(result.processedCount).toBe(2);

    // 验证所有提现状态已更新为失败
    const updatedWithdrawal1 = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', withdrawal1.id);
    const updatedWithdrawal2 = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', withdrawal2.id);
    
    expect(updatedWithdrawal1.zhuangtai).toBe('failed');
    expect(updatedWithdrawal2.zhuangtai).toBe('failed');

    // 验证用户余额已返还（25 + 35 = 60）
    const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
      filters: { yonghu: { id: testUser.id } }
    });
    expect(wallets[0].usdtYue).toBe('560.00'); // 500 + 60 (返还)
  });

  test('应该处理部分记录失败的情况', async () => {
    // 创建30分钟前的broadcasted提现记录
    const thirtyMinutesAgo = new Date(Date.now() - 31 * 60 * 1000);
    
    const withdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
      data: {
        txHash: 'timeout_tx_error',
        usdtJine: 100,
        zhuangtai: 'broadcasted',
        toAddress: '0xerror123',
        yonghu: testUser.id,
        updatedAt: thirtyMinutesAgo
      }
    });

    testWithdrawals.push(withdrawal);

    // 模拟余额服务失败
    const originalAddBalance = strapi.service('api::qianbao-yue.qianbao-yue').addBalance;
    strapi.service('api::qianbao-yue.qianbao-yue').addBalance = jest.fn().mockRejectedValue(new Error('余额服务错误'));

    // 执行超时检查任务
    const result = await withdrawalTimeoutJob.handler({ strapi });

    expect(result.success).toBe(true);
    expect(result.totalFound).toBe(1);
    expect(result.processedCount).toBe(0); // 处理失败，计数为0

    // 恢复原始方法
    strapi.service('api::qianbao-yue.qianbao-yue').addBalance = originalAddBalance;
  });
}); 