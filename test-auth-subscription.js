const axios = require('axios');

const API_BASE = 'http://118.107.4.158:1337';

async function testAuthSubscription() {
  console.log('🔍 测试认购订单认证流程...\n');
  
  let jwtToken = null;
  
  try {
    // 1. 测试用户登录获取JWT token
    console.log('1️⃣ 测试用户登录获取JWT token');
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/local`, {
        identifier: 'testuser001',
        password: '123456'
      });
      
      if (loginResponse.statusCode === 200) {
        jwtToken = loginResponse.data.jwt;
        console.log('✅ 登录成功！');
        console.log(`用户ID: ${loginResponse.data.user.id}`);
        console.log(`用户名: ${loginResponse.data.user.username}`);
        console.log(`JWT Token: ${jwtToken.substring(0, 50)}...`);
      }
    } catch (error) {
      console.log('❌ 登录失败:', error.response?.data || error.message);
      console.log('请确保测试账号存在且密码正确');
      return;
    }
    
    // 2. 测试获取认购计划（应该可以公开访问）
    console.log('\n2️⃣ 测试获取认购计划（公开API）');
    try {
      const response = await axios.get(`${API_BASE}/api/dinggou-jihuas?filters[kaiqi]=true`);
      console.log('✅ 获取认购计划成功');
      console.log(`计划数量: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        const plan = response.data.data[0];
        console.log(`第一个计划ID: ${plan.id}`);
        console.log(`计划代码: ${plan.attributes?.jihuaCode || plan.jihuaCode}`);
        console.log(`本金金额: ${plan.attributes?.benjinUSDT || plan.benjinUSDT}U`);
      }
    } catch (error) {
      console.log('❌ 获取认购计划失败:', error.response?.data || error.message);
    }
    
    // 3. 测试获取用户钱包余额（需要认证）
    console.log('\n3️⃣ 测试获取用户钱包余额（需要认证）');
    try {
      const response = await axios.get(`${API_BASE}/api/qianbao-yues`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      console.log('✅ 获取钱包余额成功');
      console.log(`钱包数量: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        const wallet = response.data.data[0];
        console.log(`钱包ID: ${wallet.id}`);
        console.log(`USDT余额: ${wallet.usdtYue || wallet.attributes?.usdtYue || 0}`);
        console.log(`AI余额: ${wallet.aiYue || wallet.attributes?.aiYue || 0}`);
      }
    } catch (error) {
      console.log('❌ 获取钱包余额失败:', error.response?.data || error.message);
    }
    
    // 4. 测试创建认购订单（需要认证）
    console.log('\n4️⃣ 测试创建认购订单（需要认证）');
    try {
      const response = await axios.post(`${API_BASE}/api/dinggou-dingdans`, {
        data: {
          jihuaId: 1
        }
      }, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ 创建认购订单成功！');
      console.log('响应状态码:', response.status);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ 创建认购订单失败');
      console.log('状态码:', error.response?.status);
      console.log('错误信息:', error.response?.data);
      
      if (error.response?.status === 403) {
        console.log('🔍 403错误分析:');
        console.log('- 用户可能没有足够的余额');
        console.log('- 用户可能没有权限');
        console.log('- Token可能已过期');
      }
    }
    
    // 5. 测试获取用户信息（验证token有效性）
    console.log('\n5️⃣ 测试获取用户信息（验证token有效性）');
    try {
      const response = await axios.get(`${API_BASE}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      
      console.log('✅ 获取用户信息成功');
      console.log('用户ID:', response.data.id);
      console.log('用户名:', response.data.username);
      console.log('邮箱:', response.data.email);
      
    } catch (error) {
      console.log('❌ 获取用户信息失败:', error.response?.data || error.message);
      console.log('Token可能无效或已过期');
    }
    
    // 6. 提供诊断建议
    console.log('\n6️⃣ 诊断建议');
    console.log('如果认购订单创建失败，可能的原因：');
    console.log('1. 用户余额不足');
    console.log('2. 认购计划已关闭');
    console.log('3. 用户权限不足');
    console.log('4. Token过期');
    console.log('5. 后端服务异常');
    
    console.log('\n🎉 认证测试完成！');
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

// 运行测试
testAuthSubscription(); 