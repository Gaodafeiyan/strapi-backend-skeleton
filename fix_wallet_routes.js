const fs = require('fs');
const path = require('path');

// 修复钱包路由配置
function fixWalletRoutes() {
  console.log('🔧 开始修复钱包路由配置...\n');

  try {
    // 1. 检查钱包路由文件
    const walletRoutesPath = path.join(__dirname, 'src/api/qianbao-yue/routes/qianbao-yue.ts');
    
    if (!fs.existsSync(walletRoutesPath)) {
      console.log('❌ 钱包路由文件不存在:', walletRoutesPath);
      return;
    }

    console.log('✅ 钱包路由文件存在');

    // 2. 检查钱包控制器文件
    const walletControllerPath = path.join(__dirname, 'src/api/qianbao-yue/controllers/qianbao-yue.ts');
    
    if (!fs.existsSync(walletControllerPath)) {
      console.log('❌ 钱包控制器文件不存在:', walletControllerPath);
      return;
    }

    console.log('✅ 钱包控制器文件存在');

    // 3. 检查钱包服务文件
    const walletServicePath = path.join(__dirname, 'src/api/qianbao-yue/services/qianbao-yue.ts');
    
    if (!fs.existsSync(walletServicePath)) {
      console.log('❌ 钱包服务文件不存在:', walletServicePath);
      return;
    }

    console.log('✅ 钱包服务文件存在');

    // 4. 检查内容类型文件
    const contentTypePath = path.join(__dirname, 'src/api/qianbao-yue/content-types/qianbao-yue/schema.json');
    
    if (!fs.existsSync(contentTypePath)) {
      console.log('❌ 钱包内容类型文件不存在:', contentTypePath);
      return;
    }

    console.log('✅ 钱包内容类型文件存在');

    // 5. 生成修复建议
    console.log('\n5. 修复建议:');
    console.log('问题可能是路由没有正确注册到Strapi中。');
    console.log('解决方案:');
    console.log('  1. 重启Strapi服务器');
    console.log('  2. 检查Strapi日志中的路由注册信息');
    console.log('  3. 确保所有API模块都正确加载');

    // 6. 检查其他相关API模块
    console.log('\n6. 检查其他API模块...');
    
    const apiModules = [
      'dinggou-jihua',
      'dinggou-dingdan', 
      'qianbao-yue',
      'qianbao-chongzhi',
      'qianbao-tixian',
      'notice',
      'ai-token'
    ];

    apiModules.forEach(module => {
      const modulePath = path.join(__dirname, 'src/api', module);
      if (fs.existsSync(modulePath)) {
        console.log(`✅ ${module} 模块存在`);
      } else {
        console.log(`❌ ${module} 模块不存在`);
      }
    });

    // 7. 生成重启命令
    console.log('\n7. 重启Strapi服务器:');
    console.log('  在服务器上运行:');
    console.log('  cd strapi-backend-skeleton');
    console.log('  npm run develop');
    console.log('  或者:');
    console.log('  npm run build');
    console.log('  npm run start');

    // 8. 检查Strapi配置
    console.log('\n8. 检查Strapi配置...');
    
    const configFiles = [
      'config/middlewares.ts',
      'config/api.ts',
      'config/database.ts'
    ];

    configFiles.forEach(configFile => {
      const configPath = path.join(__dirname, configFile);
      if (fs.existsSync(configPath)) {
        console.log(`✅ ${configFile} 存在`);
      } else {
        console.log(`❌ ${configFile} 不存在`);
      }
    });

    console.log('\n✅ 钱包路由修复检查完成');

  } catch (error) {
    console.error('修复过程中发生错误:', error.message);
  }
}

// 运行修复
fixWalletRoutes(); 