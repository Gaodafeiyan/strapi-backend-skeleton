const axios = require('axios');

// 配置
const STRAPI_URL = 'http://118.107.4.158:1337';
const SIGNER_URL = 'http://localhost:3001';

// 测试数据
const testWithdrawData = {
  yonghu: 1,  // 用户ID
  usdtJine: "10.00",  // USDT金额
  toAddress: "0xe3353f75d68f9096aC4A49b4968e56b5DFbd2697",  // 目标地址
  network: "BSC",  // 网络
  zhuangtai: "pending"  // 状态
};

async function testWithdrawFlow() {
  console.log('�� 开始测试提现流程...\n');

  try {
    // 1. 检查Strapi健康状态
    console.log('1️⃣ 检查Strapi服务状态...');
    try {
      const strapiHealth = await axios.get(`${STRAPI_URL}/api/health`);
      console.log('✅ Strapi服务正常:', strapiHealth.data);
    } catch (error) {
      // 尝试其他路径
      try {
        const strapiHealth = await axios.get(`${STRAPI_URL}/health`);
        console.log('✅ Strapi服务正常:', strapiHealth.data);
      } catch (error2) {
        console.log('⚠️ Strapi服务运行中，但健康检查API不可用');
      }
    }
    console.log('');

    // 2. 检查Signer服务状态
    console.log('2️⃣ 检查Signer服务状态...');
    const signerHealth = await axios.get(`${SIGNER_URL}/health`);
    console.log('✅ Signer服务正常:', signerHealth.data);
    console.log('');

    // 3. 检查队列状态
    console.log('3️⃣ 检查队列状态...');
    const queueStatus = await axios.get(`${SIGNER_URL}/api/queue/status`);
    console.log('📊 队列状态:', queueStatus.data);
    console.log('');

    // 4. 创建提现记录
    console.log('4️⃣ 创建提现记录...');
    const withdrawResponse = await axios.post(`${STRAPI_URL}/api/qianbao-tixians`, {
      data: testWithdrawData
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000, // 10秒超时
      maxRedirects: 5
    });
    
    const withdrawalId = withdrawResponse.data.data.id;
    console.log('✅ 提现记录创建成功, ID:', withdrawalId);
    console.log('📝 提现详情:', withdrawResponse.data.data);
    console.log('');

    // 5. 等待处理并检查状态
    console.log('5️⃣ 等待处理完成...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒

    // 6. 检查最终状态 - 使用find方法查询所有记录
    console.log('6️⃣ 检查最终状态...');
    try {
      const allWithdrawals = await axios.get(`${STRAPI_URL}/api/qianbao-tixians`);
      const currentWithdrawal = allWithdrawals.data.data.find(w => w.id === withdrawalId);
      if (currentWithdrawal) {
        console.log('📊 最终状态:', currentWithdrawal.zhuangtai);
        console.log('📋 完整记录:', currentWithdrawal);
      } else {
        console.log('⚠️ 未找到提现记录');
      }
    } catch (error) {
      console.log('❌ 查询失败:', error.message);
      if (error.response) {
        console.log('📋 错误详情:', error.response.data);
      }
    }
    console.log('');

    // 7. 再次检查队列状态
    console.log('7️⃣ 检查处理后的队列状态...');
    const finalQueueStatus = await axios.get(`${SIGNER_URL}/api/queue/status`);
    console.log('📊 处理后队列状态:', finalQueueStatus.data);
    console.log('');

    console.log('🎉 提现流程测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📋 错误详情:', error.response.data);
    }
  }
}

// 运行测试
testWithdrawFlow();