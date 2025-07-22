const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

// 测试数据
const testData = {
  user: {
    username: 'webhooktest',
    email: 'webhooktest@example.com',
    password: 'password123'
  },
  recharge: {
    txHash: 'test_recharge_webhook_123',
    usdtJine: 200
  },
  withdrawal: {
    txHash: 'test_withdrawal_webhook_456',
    usdtJine: 50,
    toAddress: '0xwebhook123'
  }
};

async function testWebhookIntegration() {
  console.log('🚀 开始Webhook集成测试...\n');

  try {
    // 1. 创建测试用户
    console.log('1. 创建测试用户...');
    const userResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: testData.user.username,
      email: testData.user.email,
      password: testData.user.password,
      yaoqingMa: 'WEBHOOK123'
    });
    
    const userId = userResponse.data.user.id;
    console.log(`✅ 用户创建成功: ID=${userId}\n`);

    // 2. 创建充值记录
    console.log('2. 创建充值记录...');
    const rechargeResponse = await axios.post(`${BASE_URL}/api/qianbao-chongzhis`, {
      data: {
        txHash: testData.recharge.txHash,
        usdtJine: testData.recharge.usdtJine,
        yonghu: userId
      }
    });
    
    const rechargeId = rechargeResponse.data.data.id;
    console.log(`✅ 充值记录创建成功: ID=${rechargeId}, 状态=${rechargeResponse.data.data.zhuangtai}\n`);

    // 3. 测试充值确认webhook
    console.log('3. 测试充值确认webhook...');
    const rechargeWebhookResponse = await axios.post(`${BASE_URL}/api/webhook/transaction`, {
      txHash: testData.recharge.txHash,
      status: 'success',
      type: 'recharge'
    });
    
    console.log(`✅ 充值确认webhook响应:`, rechargeWebhookResponse.data);

    // 验证充值状态
    const updatedRecharge = await axios.get(`${BASE_URL}/api/qianbao-chongzhis/${rechargeId}`);
    console.log(`✅ 充值状态已更新: ${updatedRecharge.data.data.zhuangtai}\n`);

    // 4. 创建提现记录
    console.log('4. 创建提现记录...');
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/qianbao-tixians`, {
      data: {
        toAddress: testData.withdrawal.toAddress,
        usdtJine: testData.withdrawal.usdtJine,
        yonghu: userId
      }
    });
    
    const withdrawalId = withdrawalResponse.data.data.id;
    console.log(`✅ 提现记录创建成功: ID=${withdrawalId}, 状态=${withdrawalResponse.data.data.zhuangtai}\n`);

    // 5. 广播提现
    console.log('5. 广播提现...');
    const broadcastResponse = await axios.put(`${BASE_URL}/api/qianbao-tixians/${withdrawalId}/broadcast`, {
      txHash: testData.withdrawal.txHash
    });
    
    console.log(`✅ 提现广播成功: ${broadcastResponse.data.message}\n`);

    // 6. 测试提现确认webhook
    console.log('6. 测试提现确认webhook...');
    const withdrawalWebhookResponse = await axios.post(`${BASE_URL}/api/webhook/transaction`, {
      txHash: testData.withdrawal.txHash,
      status: 'success',
      type: 'withdrawal'
    });
    
    console.log(`✅ 提现确认webhook响应:`, withdrawalWebhookResponse.data);

    // 验证提现状态
    const updatedWithdrawal = await axios.get(`${BASE_URL}/api/qianbao-tixians/${withdrawalId}`);
    console.log(`✅ 提现状态已更新: ${updatedWithdrawal.data.data.zhuangtai}\n`);

    // 7. 测试幂等性
    console.log('7. 测试幂等性...');
    try {
      await axios.post(`${BASE_URL}/api/webhook/transaction`, {
        txHash: testData.recharge.txHash,
        status: 'success',
        type: 'recharge'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ 幂等性测试通过: ${error.response.data.error.message}\n`);
      } else {
        throw error;
      }
    }

    // 8. 测试失败处理
    console.log('8. 测试失败处理...');
    
    // 创建新的充值记录用于失败测试
    const failRechargeResponse = await axios.post(`${BASE_URL}/api/qianbao-chongzhis`, {
      data: {
        txHash: 'test_fail_recharge_789',
        usdtJine: 100,
        yonghu: userId
      }
    });

    const failRechargeId = failRechargeResponse.data.data.id;
    
    // 发送失败状态
    const failWebhookResponse = await axios.post(`${BASE_URL}/api/webhook/transaction`, {
      txHash: 'test_fail_recharge_789',
      status: 'failed',
      type: 'recharge'
    });
    
    console.log(`✅ 失败处理webhook响应:`, failWebhookResponse.data);

    // 验证失败状态
    const failedRecharge = await axios.get(`${BASE_URL}/api/qianbao-chongzhis/${failRechargeId}`);
    console.log(`✅ 失败状态已更新: ${failedRecharge.data.data.zhuangtai}\n`);

    // 9. 查看用户余额
    console.log('9. 查看用户余额...');
    const walletsResponse = await axios.get(`${BASE_URL}/api/qianbao-yues?filters[yonghu][id]=${userId}`);
    const wallet = walletsResponse.data.data[0];
    console.log(`✅ 用户余额: USDT=${wallet.usdtYue}, AI=${wallet.aiYue}\n`);

    console.log('🎉 Webhook集成测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testWebhookIntegration();
}

module.exports = { testWebhookIntegration }; 