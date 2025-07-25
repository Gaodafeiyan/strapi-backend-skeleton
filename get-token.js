const axios = require('axios');

const API_BASE = 'http://118.107.4.158:1337';

async function getToken() {
  console.log('🔑 获取JWT Token...\n');
  
  try {
    // 使用测试账号登录
    const loginResponse = await axios.post(`${API_BASE}/api/auth/local`, {
      identifier: 'testuser001',
      password: '123456'
    });
    
    if (loginResponse.statusCode === 200) {
      const token = loginResponse.data.jwt;
      const user = loginResponse.data.user;
      
      console.log('✅ 登录成功！');
      console.log('👤 用户信息:');
      console.log(`   - 用户ID: ${user.id}`);
      console.log(`   - 用户名: ${user.username}`);
      console.log(`   - 邮箱: ${user.email}`);
      console.log('\n🔑 JWT Token:');
      console.log(token);
      console.log('\n📋 使用方法:');
      console.log('在请求头中添加:');
      console.log(`Authorization: Bearer ${token}`);
      
      return token;
    }
  } catch (error) {
    console.log('❌ 登录失败:');
    console.log('状态码:', error.response?.status);
    console.log('错误信息:', error.response?.data);
    
    if (error.response?.status === 400) {
      console.log('\n💡 可能的原因:');
      console.log('1. 用户名或密码错误');
      console.log('2. 测试账号不存在');
      console.log('3. 账号被禁用');
    }
  }
}

// 运行获取token
getToken(); 