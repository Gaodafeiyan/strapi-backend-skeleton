const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testNoticeAPI() {
  console.log('🔍 测试Notice API...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  const noticeEndpoints = [
    '/api/notices',
    '/api/notices/1',
    '/api/notices/2',
    '/api/notices/3',
    '/api/notices/4',
    '/api/notices/5',
    '/api/notices?populate=*',
    '/api/notices?sort=createdAt:desc',
    '/api/notices?pagination[page]=1&pagination[pageSize]=10'
  ];

  for (const endpoint of noticeEndpoints) {
    try {
      console.log(`测试 ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - 状态码: ${response.status}`);
        if (response.data && response.data.data) {
          console.log(`   数据条数: ${Array.isArray(response.data.data) ? response.data.data.length : 1}`);
        }
      } else if (response.status === 401) {
        console.log(`🔒 ${endpoint} - 需要认证 (状态码: ${response.status})`);
      } else if (response.status === 403) {
        console.log(`🚫 ${endpoint} - 禁止访问 (状态码: ${response.status})`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - 未找到 (状态码: ${response.status})`);
      } else if (response.status === 500) {
        console.log(`⚠️ ${endpoint} - 服务器错误 (状态码: ${response.status})`);
      } else {
        console.log(`⚠️ ${endpoint} - 其他错误 (状态码: ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - 请求失败: ${error.message}`);
    }
    console.log('');
  }

  // 测试POST创建notice
  console.log('测试创建Notice...');
  try {
    const createResponse = await axios.post(`${BASE_URL}/api/notices`, {
      data: {
        title: '测试通知',
        content: '这是一个测试通知内容',
        publishedAt: new Date().toISOString()
      }
    }, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    if (createResponse.status === 200 || createResponse.status === 201) {
      console.log(`✅ 创建Notice成功 - 状态码: ${createResponse.status}`);
    } else {
      console.log(`⚠️ 创建Notice失败 - 状态码: ${createResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ 创建Notice失败: ${error.message}`);
  }

  console.log('\n🎯 Notice API测试完成');
}

testNoticeAPI().catch(console.error); 