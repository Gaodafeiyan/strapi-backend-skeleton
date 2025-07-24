const axios = require('axios');

const API_BASE = 'http://118.107.4.158:1337';

// 测试数据 - 5000U档位计划
const testPlanData = {
  jihuaCode: 'PLAN5000',
  benjinUSDT: '5000',
  zhouQiTian: 15,
  jingtaiBili: '6',
  aiBili: '3',
  choujiangCi: 3,
  kaiqi: true
};

async function testCreatePlan() {
  try {
    console.log('🔍 开始测试创建认购计划...');
    console.log('📋 测试数据:', JSON.stringify(testPlanData, null, 2));
    
    const response = await axios.post(`${API_BASE}/content-manager/collection-types/api::dinggou-jihua.dinggou-jihua`, testPlanData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // 需要替换为实际的admin token
      },
      timeout: 10000
    });
    
    console.log('✅ 创建成功!');
    console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ 创建失败!');
    console.log('🔍 错误详情:');
    console.log('状态码:', error.response?.status);
    console.log('错误消息:', error.response?.data);
    console.log('请求数据:', error.config?.data);
    console.log('请求URL:', error.config?.url);
    console.log('请求头:', error.config?.headers);
  }
}

async function testGetPlans() {
  try {
    console.log('\n🔍 测试获取认购计划列表...');
    
    const response = await axios.get(`${API_BASE}/api/dinggou-jihuas`, {
      timeout: 10000
    });
    
    console.log('✅ 获取成功!');
    console.log('📊 计划数量:', response.data.data?.length || 0);
    console.log('📋 计划列表:', JSON.stringify(response.data.data, null, 2));
    
  } catch (error) {
    console.log('❌ 获取失败!');
    console.log('状态码:', error.response?.status);
    console.log('错误消息:', error.response?.data);
  }
}

async function testSchemaValidation() {
  console.log('\n🔍 检查Schema验证规则...');
  
  // 测试必填字段
  const requiredFields = ['jihuaCode', 'benjinUSDT', 'zhouQiTian', 'jingtaiBili', 'aiBili'];
  
  for (const field of requiredFields) {
    const testData = { ...testPlanData };
    delete testData[field];
    
    try {
      console.log(`\n📝 测试缺少必填字段: ${field}`);
      const response = await axios.post(`${API_BASE}/content-manager/collection-types/api::dinggou-jihua.dinggou-jihua`, testData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
        },
        timeout: 10000
      });
      console.log('❌ 应该失败但没有失败!');
    } catch (error) {
      console.log(`✅ 正确返回错误: ${error.response?.status}`);
      console.log(`错误消息: ${JSON.stringify(error.response?.data)}`);
    }
  }
  
  // 测试唯一性约束
  try {
    console.log('\n📝 测试重复jihuaCode...');
    const response = await axios.post(`${API_BASE}/content-manager/collection-types/api::dinggou-jihua.dinggou-jihua`, testPlanData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
      },
      timeout: 10000
    });
    console.log('❌ 应该失败但没有失败!');
  } catch (error) {
    console.log(`✅ 正确返回错误: ${error.response?.status}`);
    console.log(`错误消息: ${JSON.stringify(error.response?.data)}`);
  }
}

async function main() {
  console.log('🚀 开始诊断认购计划创建问题...\n');
  
  await testGetPlans();
  await testCreatePlan();
  await testSchemaValidation();
  
  console.log('\n🏁 诊断完成!');
}

main().catch(console.error); 