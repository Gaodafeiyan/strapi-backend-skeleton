const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testBasicAPI() {
  console.log('🔍 测试基本Strapi API...\n');
  
  const basicEndpoints = [
    '/',
    '/admin',
    '/api',
    '/api/users',
    '/api/users-permissions/roles',
    '/api/users-permissions/roles/1',
    '/api/users-permissions/roles/2',
    '/api/users-permissions/roles/3',
    '/api/users-permissions/roles/4',
    '/api/users-permissions/roles/5',
    '/api/users-permissions/roles/6',
    '/api/users-permissions/roles/7',
    '/api/users-permissions/roles/8',
    '/api/users-permissions/roles/9',
    '/api/users-permissions/roles/10',
    '/api/users-permissions/roles/11',
    '/api/users-permissions/roles/12',
    '/api/users-permissions/roles/13',
    '/api/users-permissions/roles/14',
    '/api/users-permissions/roles/15',
    '/api/users-permissions/roles/16',
    '/api/users-permissions/roles/17',
    '/api/users-permissions/roles/18',
    '/api/users-permissions/roles/19',
    '/api/users-permissions/roles/20',
    '/api/users-permissions/roles/21',
    '/api/users-permissions/roles/22',
    '/api/users-permissions/roles/23',
    '/api/users-permissions/roles/24',
    '/api/users-permissions/roles/25',
    '/api/users-permissions/roles/26',
    '/api/users-permissions/roles/27',
    '/api/users-permissions/roles/28',
    '/api/users-permissions/roles/29',
    '/api/users-permissions/roles/30',
    '/api/users-permissions/roles/31',
    '/api/users-permissions/roles/32',
    '/api/users-permissions/roles/33',
    '/api/users-permissions/roles/34',
    '/api/users-permissions/roles/35',
    '/api/users-permissions/roles/36',
    '/api/users-permissions/roles/37',
    '/api/users-permissions/roles/38',
    '/api/users-permissions/roles/39',
    '/api/users-permissions/roles/40',
    '/api/users-permissions/roles/41',
    '/api/users-permissions/roles/42',
    '/api/users-permissions/roles/43',
    '/api/users-permissions/roles/44',
    '/api/users-permissions/roles/45',
    '/api/users-permissions/roles/46',
    '/api/users-permissions/roles/47',
    '/api/users-permissions/roles/48',
    '/api/users-permissions/roles/49',
    '/api/users-permissions/roles/50',
    '/api/users-permissions/roles/51',
    '/api/users-permissions/roles/52',
    '/api/users-permissions/roles/53',
    '/api/users-permissions/roles/54',
    '/api/users-permissions/roles/55',
    '/api/users-permissions/roles/56',
    '/api/users-permissions/roles/57',
    '/api/users-permissions/roles/58',
    '/api/users-permissions/roles/59',
    '/api/users-permissions/roles/60',
    '/api/users-permissions/roles/61',
    '/api/users-permissions/roles/62',
    '/api/users-permissions/roles/63',
    '/api/users-permissions/roles/64',
    '/api/users-permissions/roles/65',
    '/api/users-permissions/roles/66',
    '/api/users-permissions/roles/67',
    '/api/users-permissions/roles/68',
    '/api/users-permissions/roles/69',
    '/api/users-permissions/roles/70',
    '/api/users-permissions/roles/71',
    '/api/users-permissions/roles/72',
    '/api/users-permissions/roles/73',
    '/api/users-permissions/roles/74',
    '/api/users-permissions/roles/75',
    '/api/users-permissions/roles/76',
    '/api/users-permissions/roles/77',
    '/api/users-permissions/roles/78',
    '/api/users-permissions/roles/79',
    '/api/users-permissions/roles/80',
    '/api/users-permissions/roles/81',
    '/api/users-permissions/roles/82',
    '/api/users-permissions/roles/83',
    '/api/users-permissions/roles/84',
    '/api/users-permissions/roles/85',
    '/api/users-permissions/roles/86',
    '/api/users-permissions/roles/87',
    '/api/users-permissions/roles/88',
    '/api/users-permissions/roles/89',
    '/api/users-permissions/roles/90',
    '/api/users-permissions/roles/91',
    '/api/users-permissions/roles/92',
    '/api/users-permissions/roles/93',
    '/api/users-permissions/roles/94',
    '/api/users-permissions/roles/95',
    '/api/users-permissions/roles/96',
    '/api/users-permissions/roles/97',
    '/api/users-permissions/roles/98',
    '/api/users-permissions/roles/99',
    '/api/users-permissions/roles/100'
  ];

  for (const endpoint of basicEndpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - 状态码: ${response.status}`);
      } else if (response.status === 401) {
        console.log(`🔒 ${endpoint} - 需要认证 (状态码: ${response.status})`);
      } else if (response.status === 403) {
        console.log(`🚫 ${endpoint} - 禁止访问 (状态码: ${response.status})`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - 未找到 (状态码: ${response.status})`);
      } else {
        console.log(`⚠️ ${endpoint} - 其他错误 (状态码: ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - 请求失败: ${error.message}`);
    }
  }
}

testBasicAPI().catch(console.error); 