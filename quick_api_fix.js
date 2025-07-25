const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

console.log(colors.blue('🔧 开始快速修复API问题...\n'));

// 1. 测试认证系统修复
async function testAuthFix() {
  console.log(colors.cyan('🔐 测试认证系统修复...'));
  
  // 测试不同的注册数据格式
  const testCases = [
    {
      name: '标准注册格式',
      data: {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'Test123456!',
        phone: '13800138001'
      }
    },
    {
      name: '简化注册格式',
      data: {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'Test123456!'
      }
    },
    {
      name: 'Strapi标准格式',
      data: {
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'Test123456!',
        confirmed: true
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(colors.yellow(`测试: ${testCase.name}`));
      const response = await axios.post(`${BASE_URL}/api/auth/local/register`, testCase.data, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(colors.green(`✅ ${testCase.name} - 成功`));
        return response.data;
      } else {
        console.log(colors.red(`❌ ${testCase.name} - 失败 (${response.status})`));
        if (response.data && response.data.error) {
          console.log(colors.red(`   错误: ${JSON.stringify(response.data.error)}`));
        }
      }
    } catch (error) {
      console.log(colors.red(`❌ ${testCase.name} - 请求失败: ${error.message}`));
    }
  }
}

// 2. 创建测试数据
async function createTestData() {
  console.log(colors.cyan('\n📝 创建测试数据...'));
  
  const testData = [
    {
      endpoint: '/api/notices',
      data: {
        data: {
          title: '系统测试通知',
          content: '这是一个系统测试通知',
          type: 'system',
          status: 'published'
        }
      }
    },
    {
      endpoint: '/api/dinggou-jihuas',
      data: {
        data: {
          name: '测试认购计划',
          description: '这是一个测试认购计划',
          price: 100,
          total_supply: 1000,
          status: 'active',
          publishedAt: new Date().toISOString()
        }
      }
    },
    {
      endpoint: '/api/shop-products',
      data: {
        data: {
          name: '测试商品',
          description: '这是一个测试商品',
          price: 99.99,
          stock: 100,
          status: 'active',
          publishedAt: new Date().toISOString()
        }
      }
    },
    {
      endpoint: '/api/choujiang-jiangpins',
      data: {
        data: {
          name: '测试奖品',
          description: '这是一个测试奖品',
          value: 50,
          probability: 0.1,
          status: 'active',
          publishedAt: new Date().toISOString()
        }
      }
    }
  ];

  for (const item of testData) {
    try {
      console.log(colors.yellow(`创建: ${item.endpoint}`));
      const response = await axios.post(`${BASE_URL}${item.endpoint}`, item.data, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(colors.green(`✅ ${item.endpoint} - 创建成功`));
      } else {
        console.log(colors.red(`❌ ${item.endpoint} - 创建失败 (${response.status})`));
        if (response.data && response.data.error) {
          console.log(colors.red(`   错误: ${JSON.stringify(response.data.error)}`));
        }
      }
    } catch (error) {
      console.log(colors.red(`❌ ${item.endpoint} - 请求失败: ${error.message}`));
    }
  }
}

// 3. 测试权限问题
async function testPermissions() {
  console.log(colors.cyan('\n🔒 测试权限问题...'));
  
  const permissionEndpoints = [
    '/api/choujiang-jihuis',
    '/api/choujiang-jiangpins',
    '/api/choujiang-ji-lus',
    '/api/caches',
    '/api/token-reward-records'
  ];

  for (const endpoint of permissionEndpoints) {
    try {
      console.log(colors.yellow(`测试权限: ${endpoint}`));
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 403) {
        console.log(colors.red(`❌ ${endpoint} - 权限被拒绝 (403)`));
        console.log(colors.yellow(`   需要检查权限配置`));
      } else if (response.status === 200) {
        console.log(colors.green(`✅ ${endpoint} - 权限正常`));
      } else {
        console.log(colors.yellow(`⚠️ ${endpoint} - 其他状态 (${response.status})`));
      }
    } catch (error) {
      console.log(colors.red(`❌ ${endpoint} - 请求失败: ${error.message}`));
    }
  }
}

// 4. 测试服务器错误
async function testServerErrors() {
  console.log(colors.cyan('\n🛠️ 测试服务器错误...'));
  
  const errorEndpoints = [
    {
      endpoint: '/api/notices',
      method: 'POST',
      data: {
        data: {
          title: '测试通知',
          content: '测试内容'
        }
      }
    },
    {
      endpoint: '/api/qianbao-chongzhis',
      method: 'POST',
      data: {
        data: {
          amount: 100,
          currency: 'USDT'
        }
      }
    }
  ];

  for (const item of errorEndpoints) {
    try {
      console.log(colors.yellow(`测试: ${item.method} ${item.endpoint}`));
      const response = await axios({
        method: item.method,
        url: `${BASE_URL}${item.endpoint}`,
        data: item.data,
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 500) {
        console.log(colors.red(`❌ ${item.endpoint} - 服务器错误 (500)`));
        console.log(colors.yellow(`   需要检查服务器端逻辑`));
      } else if (response.status >= 200 && response.status < 300) {
        console.log(colors.green(`✅ ${item.endpoint} - 正常`));
      } else {
        console.log(colors.yellow(`⚠️ ${item.endpoint} - 状态码: ${response.status}`));
      }
    } catch (error) {
      console.log(colors.red(`❌ ${item.endpoint} - 请求失败: ${error.message}`));
    }
  }
}

// 5. 生成修复建议
function generateFixSuggestions() {
  console.log(colors.cyan('\n💡 修复建议:'));
  
  const suggestions = [
    {
      priority: '高',
      issue: '认证系统问题',
      suggestion: '检查用户注册和登录的数据验证规则，确保字段格式正确'
    },
    {
      priority: '高',
      issue: '抽奖系统权限问题',
      suggestion: '检查抽奖相关接口的权限配置，确保用户角色有正确权限'
    },
    {
      priority: '中',
      issue: '服务器错误',
      suggestion: '检查返回500错误的接口，修复服务器端逻辑问题'
    },
    {
      priority: '中',
      issue: '数据验证问题',
      suggestion: '完善POST接口的数据验证规则，确保必填字段和格式正确'
    },
    {
      priority: '低',
      issue: '缺失接口',
      suggestion: '实现返回404的接口，或者更新路由配置'
    }
  ];

  suggestions.forEach((item, index) => {
    const priorityColor = item.priority === '高' ? colors.red : item.priority === '中' ? colors.yellow : colors.green;
    console.log(`${index + 1}. ${priorityColor(`[${item.priority}]`)} ${item.issue}`);
    console.log(`   ${item.suggestion}\n`);
  });
}

// 主函数
async function runQuickFix() {
  try {
    await testAuthFix();
    await createTestData();
    await testPermissions();
    await testServerErrors();
    generateFixSuggestions();
    
    console.log(colors.blue('\n🎯 快速修复测试完成！'));
    console.log(colors.yellow('请根据上述建议进行相应的修复工作。'));
    
  } catch (error) {
    console.error(colors.red('❌ 修复过程中发生错误:'), error);
  }
}

// 运行修复
runQuickFix(); 