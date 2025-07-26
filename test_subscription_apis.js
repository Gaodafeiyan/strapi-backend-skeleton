const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试函数
async function testAPI() {
  console.log('🔍 开始测试认购相关API接口...\n');

  try {
    // 1. 测试获取活跃认购计划
    console.log('1. 测试获取活跃认购计划...');
    try {
      const response1 = await axios.get(`${BASE_URL}/api/dinggou-jihuas/active`);
      console.log('✅ 获取活跃认购计划成功:', response1.status);
      console.log('   数据:', response1.data);
    } catch (error) {
      console.log('❌ 获取活跃认购计划失败:', error.response?.status, error.response?.data);
    }

    // 2. 测试获取所有认购计划
    console.log('\n2. 测试获取所有认购计划...');
    try {
      const response2 = await axios.get(`${BASE_URL}/api/dinggou-jihuas`);
      console.log('✅ 获取所有认购计划成功:', response2.status);
      console.log('   数据:', response2.data);
    } catch (error) {
      console.log('❌ 获取所有认购计划失败:', error.response?.status, error.response?.data);
    }

    // 3. 测试获取认购订单（需要认证）
    console.log('\n3. 测试获取认购订单（无认证）...');
    try {
      const response3 = await axios.get(`${BASE_URL}/api/dinggou-dingdans`);
      console.log('✅ 获取认购订单成功:', response3.status);
      console.log('   数据:', response3.data);
    } catch (error) {
      console.log('❌ 获取认购订单失败:', error.response?.status, error.response?.data);
    }

    // 4. 测试获取用户钱包（需要认证）
    console.log('\n4. 测试获取用户钱包（无认证）...');
    try {
      const response4 = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`);
      console.log('✅ 获取用户钱包成功:', response4.status);
      console.log('   数据:', response4.data);
    } catch (error) {
      console.log('❌ 获取用户钱包失败:', error.response?.status, error.response?.data);
    }

    // 5. 测试通知API（应该可以访问）
    console.log('\n5. 测试获取活跃通知...');
    try {
      const response5 = await axios.get(`${BASE_URL}/api/notices/active`);
      console.log('✅ 获取活跃通知成功:', response5.status);
      console.log('   数据:', response5.data);
    } catch (error) {
      console.log('❌ 获取活跃通知失败:', error.response?.status, error.response?.data);
    }

    // 6. 测试健康检查
    console.log('\n6. 测试健康检查...');
    try {
      const response6 = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ 健康检查成功:', response6.status);
      console.log('   数据:', response6.data);
    } catch (error) {
      console.log('❌ 健康检查失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testAPI(); 