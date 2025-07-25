const fs = require('fs');
const path = require('path');

function verifyAPIRegistration() {
  console.log('🔍 验证API注册状态...\n');

  const apiDir = path.join(__dirname, 'src', 'api');
  const apis = fs.readdirSync(apiDir).filter(dir => 
    fs.statSync(path.join(apiDir, dir)).isDirectory() && dir !== '.gitkeep'
  );

  console.log(`发现 ${apis.length} 个API模块:\n`);

  const issues = [];

  for (const api of apis) {
    console.log(`检查 ${api} API:`);
    const apiPath = path.join(apiDir, api);
    
    // 检查routes
    const routesPath = path.join(apiPath, 'routes');
    if (fs.existsSync(routesPath)) {
      const routeFiles = fs.readdirSync(routesPath);
      console.log(`  ✅ routes: ${routeFiles.join(', ')}`);
      
      // 检查路由文件内容
      for (const routeFile of routeFiles) {
        const routeContent = fs.readFileSync(path.join(routesPath, routeFile), 'utf8');
        if (!routeContent.includes('export default')) {
          issues.push(`${api}/routes/${routeFile} - 缺少默认导出`);
        }
      }
    } else {
      console.log(`  ❌ 缺少routes目录`);
      issues.push(`${api} - 缺少routes目录`);
    }

    // 检查controllers
    const controllersPath = path.join(apiPath, 'controllers');
    if (fs.existsSync(controllersPath)) {
      const controllerFiles = fs.readdirSync(controllersPath);
      console.log(`  ✅ controllers: ${controllerFiles.join(', ')}`);
    } else {
      console.log(`  ❌ 缺少controllers目录`);
      issues.push(`${api} - 缺少controllers目录`);
    }

    // 检查content-types
    const contentTypesPath = path.join(apiPath, 'content-types');
    if (fs.existsSync(contentTypesPath)) {
      const contentTypeDirs = fs.readdirSync(contentTypesPath);
      console.log(`  ✅ content-types: ${contentTypeDirs.join(', ')}`);
      
      for (const contentTypeDir of contentTypeDirs) {
        const schemaPath = path.join(contentTypesPath, contentTypeDir, 'schema.ts');
        if (fs.existsSync(schemaPath)) {
          console.log(`    ✅ schema: ${contentTypeDir}/schema.ts`);
        } else {
          console.log(`    ❌ 缺少schema文件: ${contentTypeDir}`);
          issues.push(`${api}/content-types/${contentTypeDir} - 缺少schema.ts`);
        }
      }
    } else {
      console.log(`  ❌ 缺少content-types目录`);
      issues.push(`${api} - 缺少content-types目录`);
    }
    console.log('');
  }

  if (issues.length > 0) {
    console.log('🚨 发现的问题:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ 所有API模块结构正确');
  }

  console.log('\n🎯 API注册验证完成');
}

verifyAPIRegistration(); 