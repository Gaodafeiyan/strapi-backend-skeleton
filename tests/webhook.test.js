const request = require('supertest');

describe('Webhook Tests', () => {
  let strapi;
  let testUser;
  let testRecharge;
  let testWithdrawal;

  beforeAll(async () => {
    strapi = await require('@strapi/strapi').Strapi().load();
    
    // 创建测试用户
    testUser = await strapi.entityService.create('plugin::users-permissions.user', {
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmed: true,
        blocked: false,
        yaoqingMa: 'TEST123'
      }
    });

    // 创建测试用户钱包
    await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
      data: {
        yonghu: testUser.id,
        usdtYue: '1000.00',
        aiYue: '0.00000000'
      }
    });
  });

  afterAll(async () => {
    // 清理测试数据
    if (testRecharge) {
      await strapi.entityService.delete('api::qianbao-chongzhi.qianbao-chongzhi', testRecharge.id);
    }
    if (testWithdrawal) {
      await strapi.entityService.delete('api::qianbao-tixian.qianbao-tixian', testWithdrawal.id);
    }
    if (testUser) {
      await strapi.entityService.delete('plugin::users-permissions.user', testUser.id);
    }
    await strapi.destroy();
  });

  describe('充值确认测试', () => {
    beforeEach(async () => {
      // 创建测试充值记录
      testRecharge = await strapi.entityService.create('api::qianbao-chongzhi.qianbao-chongzhi', {
        data: {
          txHash: 'test_recharge_tx_123',
          usdtJine: 100,
          zhuangtai: 'pending',
          yonghu: testUser.id
        }
      });
    });

    test('应该成功确认充值并增加余额', async () => {
      const response = await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_recharge_tx_123',
          status: 'success',
          type: 'recharge'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('recharge 交易处理成功');

      // 验证充值状态已更新
      const updatedRecharge = await strapi.entityService.findOne('api::qianbao-chongzhi.qianbao-chongzhi', testRecharge.id);
      expect(updatedRecharge.zhuangtai).toBe('success');

      // 验证用户余额已增加
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { yonghu: { id: testUser.id } }
      });
      expect(wallets[0].usdtYue).toBe('1100.00'); // 1000 + 100
    });

    test('应该处理充值失败状态', async () => {
      const response = await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_recharge_tx_123',
          status: 'failed',
          type: 'recharge'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证充值状态已更新为失败
      const updatedRecharge = await strapi.entityService.findOne('api::qianbao-chongzhi.qianbao-chongzhi', testRecharge.id);
      expect(updatedRecharge.zhuangtai).toBe('failed');

      // 验证用户余额未变化
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { yonghu: { id: testUser.id } }
      });
      expect(wallets[0].usdtYue).toBe('1000.00');
    });

    test('应该防止重复处理同一交易', async () => {
      // 第一次处理
      await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_recharge_tx_123',
          status: 'success',
          type: 'recharge'
        })
        .expect(200);

      // 第二次处理应该被拒绝
      const response = await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_recharge_tx_123',
          status: 'success',
          type: 'recharge'
        })
        .expect(400);

      expect(response.body.error.message).toContain('该交易已处理，避免重复操作');
    });
  });

  describe('提现确认测试', () => {
    beforeEach(async () => {
      // 创建测试提现记录
      testWithdrawal = await strapi.entityService.create('api::qianbao-tixian.qianbao-tixian', {
        data: {
          txHash: 'test_withdrawal_tx_456',
          usdtJine: 50,
          zhuangtai: 'broadcasted',
          toAddress: '0x123456789',
          yonghu: testUser.id
        }
      });
    });

    test('应该成功确认提现', async () => {
      const response = await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_withdrawal_tx_456',
          status: 'success',
          type: 'withdrawal'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('withdrawal 交易处理成功');

      // 验证提现状态已更新
      const updatedWithdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', testWithdrawal.id);
      expect(updatedWithdrawal.zhuangtai).toBe('success');
    });

    test('应该处理提现失败并返还余额', async () => {
      const response = await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_withdrawal_tx_456',
          status: 'failed',
          type: 'withdrawal'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证提现状态已更新为失败
      const updatedWithdrawal = await strapi.entityService.findOne('api::qianbao-tixian.qianbao-tixian', testWithdrawal.id);
      expect(updatedWithdrawal.zhuangtai).toBe('failed');

      // 验证用户余额已返还
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { yonghu: { id: testUser.id } }
      });
      expect(wallets[0].usdtYue).toBe('1050.00'); // 1000 + 50 (返还)
    });
  });

  describe('参数验证测试', () => {
    test('应该验证必要参数', async () => {
      const response = await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_tx',
          // 缺少 status 和 type
        })
        .expect(400);

      expect(response.body.error.message).toContain('缺少必要参数');
    });

    test('应该验证交易类型', async () => {
      const response = await request(strapi.server.httpServer)
        .post('/api/webhook/transaction')
        .send({
          txHash: 'test_tx',
          status: 'success',
          type: 'invalid_type'
        })
        .expect(400);

      expect(response.body.error.message).toContain('无效的交易类型');
    });
  });
}); 