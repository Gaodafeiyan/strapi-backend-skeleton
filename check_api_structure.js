const fs = require('fs');
const path = require('path');

function checkAPIStructure() {
  console.log('🔍 检查所有API结构完整性...\n');

  const apiDir = path.join(__dirname, 'src', 'api');
  const apis = fs.readdirSync(apiDir).filter(dir => 
    fs.statSync(path.join(apiDir, dir)).isDirectory() && dir !== '.gitkeep'
  );

  console.log(`📋 发现 ${apis.length} 个API:\n`);

  const results = [];

  for (const api of apis) {
    const apiPath = path.join(apiDir, api);
    const structure = {
      name: api,
      hasRoutes: false,
      hasControllers: false,
      hasServices: false,
      hasContentTypes: false,
      hasSchema: false,
      issues: []
    };

    // 检查routes
    const routesPath = path.join(apiPath, 'routes');
    if (fs.existsSync(routesPath)) {
      structure.hasRoutes = true;
      const routeFiles = fs.readdirSync(routesPath);
      if (routeFiles.length === 0) {
        structure.issues.push('routes目录为空');
      }
    } else {
      structure.issues.push('缺少routes目录');
    }

    // 检查controllers
    const controllersPath = path.join(apiPath, 'controllers');
    if (fs.existsSync(controllersPath)) {
      structure.hasControllers = true;
      const controllerFiles = fs.readdirSync(controllersPath);
      if (controllerFiles.length === 0) {
        structure.issues.push('controllers目录为空');
      }
    } else {
      structure.issues.push('缺少controllers目录');
    }

    // 检查services
    const servicesPath = path.join(apiPath, 'services');
    if (fs.existsSync(servicesPath)) {
      structure.hasServices = true;
      const serviceFiles = fs.readdirSync(servicesPath);
      if (serviceFiles.length === 0) {
        structure.issues.push('services目录为空');
      }
    } else {
      structure.issues.push('缺少services目录');
    }

    // 检查content-types
    const contentTypesPath = path.join(apiPath, 'content-types');
    if (fs.existsSync(contentTypesPath)) {
      structure.hasContentTypes = true;
      const contentTypeDirs = fs.readdirSync(contentTypesPath);
      if (contentTypeDirs.length === 0) {
        structure.issues.push('content-types目录为空');
      } else {
        // 检查schema文件
        for (const contentTypeDir of contentTypeDirs) {
          const schemaPath = path.join(contentTypesPath, contentTypeDir);
          if (fs.statSync(schemaPath).isDirectory()) {
            const schemaFiles = fs.readdirSync(schemaPath);
            const hasSchema = schemaFiles.some(file => 
              file === 'schema.ts' || file === 'schema.json'
            );
            if (hasSchema) {
              structure.hasSchema = true;
              break;
            }
          }
        }
        if (!structure.hasSchema) {
          structure.issues.push('缺少schema.ts或schema.json文件');
        }
      }
    } else {
      structure.issues.push('缺少content-types目录');
    }

    results.push(structure);

    // 显示结果
    const status = structure.issues.length === 0 ? '✅' : '❌';
    console.log(`${status} ${api}`);
    
    if (structure.issues.length > 0) {
      console.log(`   问题: ${structure.issues.join(', ')}`);
    }
    console.log('');
  }

  // 统计
  const complete = results.filter(r => r.issues.length === 0).length;
  const incomplete = results.filter(r => r.issues.length > 0).length;

  console.log('📊 统计结果:');
  console.log(`✅ 完整的API: ${complete}`);
  console.log(`❌ 不完整的API: ${incomplete}`);
  console.log(`📈 完整率: ${((complete / results.length) * 100).toFixed(1)}%`);

  // 显示有问题的API
  if (incomplete > 0) {
    console.log('\n🚨 有问题的API:');
    results.filter(r => r.issues.length > 0).forEach(r => {
      console.log(`❌ ${r.name}: ${r.issues.join(', ')}`);
    });
  }

  return results;
}

// 运行检查
checkAPIStructure(); 