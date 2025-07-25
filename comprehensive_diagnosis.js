const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

async function comprehensiveDiagnosis() {
  console.log('🔍 全面诊断Strapi API问题...\n');

  // 1. 检查API结构
  console.log('1️⃣ 检查API结构完整性...');
  const apiDir = path.join(__dirname, 'src', 'api');
  const apis = fs.readdirSync(apiDir).filter(dir => 
    fs.statSync(path.join(apiDir, dir)).isDirectory() && dir !== '.gitkeep'
  );

  console.log(`发现 ${apis.length} 个API\n`);

  // 2. 检查关键API的完整性
  const criticalAPIs = ['notice', 'qianbao-yue', 'dinggou-jihua', 'ai-token'];
  
  for (const api of criticalAPIs) {
    console.log(`检查 ${api} API:`);
    const apiPath = path.join(apiDir, api);
    
    if (!fs.existsSync(apiPath)) {
      console.log(`  ❌ API目录不存在`);
      continue;
    }

    // 检查routes
    const routesPath = path.join(apiPath, 'routes');
    if (fs.existsSync(routesPath)) {
      const routeFiles = fs.readdirSync(routesPath);
      console.log(`  ✅ routes: ${routeFiles.join(', ')}`);
    } else {
      console.log(`  ❌ 缺少routes目录`);
    }

    // 检查controllers
    const controllersPath = path.join(apiPath, 'controllers');
    if (fs.existsSync(controllersPath)) {
      const controllerFiles = fs.readdirSync(controllersPath);
      console.log(`  ✅ controllers: ${controllerFiles.join(', ')}`);
    } else {
      console.log(`  ❌ 缺少controllers目录`);
    }

    // 检查content-types
    const contentTypesPath = path.join(apiPath, 'content-types');
    if (fs.existsSync(contentTypesPath)) {
      const contentTypeDirs = fs.readdirSync(contentTypesPath);
      console.log(`  ✅ content-types: ${contentTypeDirs.join(', ')}`);
      
      // 检查schema文件
      for (const contentTypeDir of contentTypeDirs) {
        const schemaPath = path.join(contentTypesPath, contentTypeDir);
        if (fs.statSync(schemaPath).isDirectory()) {
          const schemaFiles = fs.readdirSync(schemaPath);
          const schemaFile = schemaFiles.find(file => 
            file === 'schema.ts' || file === 'schema.json'
          );
          if (schemaFile) {
            console.log(`    ✅ schema: ${schemaFile}`);
          } else {
            console.log(`    ❌ 缺少schema文件`);
          }
        }
      }
    } else {
      console.log(`  ❌ 缺少content-types目录`);
    }
    console.log('');
  }

  // 3. 检查Strapi配置
  console.log('2️⃣ 检查Strapi配置...');
  const configFiles = [
    'config/api.ts',
    'config/database.ts',
    'config/middlewares.ts',
    'config/plugins.ts',
    'src/index.ts'
  ];

  for (const configFile of configFiles) {
    const configPath = path.join(__dirname, configFile);
    if (fs.existsSync(configPath)) {
      console.log(`  ✅ ${configFile} 存在`);
    } else {
      console.log(`  ❌ ${configFile} 不存在`);
    }
  }
  console.log('');

  // 4. 测试Strapi连接
  console.log('3️⃣ 测试Strapi连接...');
  try {
    const response = await axios.get(`${BASE_URL}`, {
      timeout: 5000,
      validateStatus: () => true
    });
    console.log(`  ✅ Strapi服务器响应: ${response.status}`);
  } catch (error) {
    console.log(`  ❌ Strapi连接失败: ${error.message}`);
  }

  // 5. 测试管理面板
  try {
    const response = await axios.get(`${BASE_URL}/admin`, {
      timeout: 5000,
      validateStatus: () => true
    });
    console.log(`  ✅ 管理面板响应: ${response.status}`);
  } catch (error) {
    console.log(`  ❌ 管理面板连接失败: ${error.message}`);
  }
  console.log('');

  // 6. 测试API端点
  console.log('4️⃣ 测试API端点...');
  const testEndpoints = [
    '/api/notices',
    '/api/qianbao-yues',
    '/api/dinggou-jihuas',
    '/api/ai-tokens'
  ];

  for (const endpoint of testEndpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(`  ✅ ${endpoint} - 200`);
      } else if (response.status === 401) {
        console.log(`  🔒 ${endpoint} - 401 (需要认证)`);
      } else if (response.status === 404) {
        console.log(`  ❌ ${endpoint} - 404 (未找到)`);
      } else {
        console.log(`  ⚠️ ${endpoint} - ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint} - 请求失败: ${error.message}`);
    }
  }
  console.log('');

  // 7. 检查package.json
  console.log('5️⃣ 检查依赖...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`  ✅ Strapi版本: ${packageJson.dependencies['@strapi/strapi'] || '未找到'}`);
    console.log(`  ✅ Node版本: ${process.version}`);
  } catch (error) {
    console.log(`  ❌ 读取package.json失败: ${error.message}`);
  }
  console.log('');

  // 8. 总结和建议
  console.log('🎯 诊断总结:');
  console.log('如果所有API都返回404，可能的原因:');
  console.log('1. Strapi没有正确加载API路由');
  console.log('2. API的content-types配置有问题');
  console.log('3. 路由文件格式不正确');
  console.log('4. Strapi启动时出现错误');
  console.log('');
  console.log('💡 建议的修复步骤:');
  console.log('1. 检查Strapi启动日志');
  console.log('2. 确保所有API都有完整的结构');
  console.log('3. 清理缓存并重启Strapi');
  console.log('4. 检查数据库连接');
}

// 运行诊断
comprehensiveDiagnosis().catch(console.error); 