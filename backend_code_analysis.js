const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`
};

// 分析结果
const analysisResults = {
  totalAPIs: 0,
  validAPIs: 0,
  invalidAPIs: 0,
  missingControllers: 0,
  missingRoutes: 0,
  missingServices: 0,
  missingModels: 0,
  apiDetails: [],
  errors: []
};

// 检查文件是否存在
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// 分析API结构
function analyzeAPI(apiName, apiPath) {
  const apiInfo = {
    name: apiName,
    path: apiPath,
    hasController: false,
    hasRoutes: false,
    hasService: false,
    hasModel: false,
    controllerMethods: [],
    routes: [],
    issues: []
  };

  // 检查控制器
  const controllerPath = path.join(apiPath, 'controllers');
  if (fileExists(controllerPath)) {
    const controllerFiles = fs.readdirSync(controllerPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    if (controllerFiles.length > 0) {
      apiInfo.hasController = true;
      const controllerFile = path.join(controllerPath, controllerFiles[0]);
      const controllerContent = readFile(controllerFile);
      if (controllerContent) {
        // 提取方法名
        const methodMatches = controllerContent.match(/async\s+(\w+)\s*\(/g);
        if (methodMatches) {
          apiInfo.controllerMethods = methodMatches.map(match => match.replace(/async\s+(\w+)\s*\(/, '$1'));
        }
      }
    } else {
      apiInfo.issues.push('控制器目录存在但无文件');
    }
  } else {
    apiInfo.issues.push('缺少控制器目录');
    analysisResults.missingControllers++;
  }

  // 检查路由
  const routesPath = path.join(apiPath, 'routes');
  if (fileExists(routesPath)) {
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    if (routeFiles.length > 0) {
      apiInfo.hasRoutes = true;
      const routeFile = path.join(routesPath, routeFiles[0]);
      const routeContent = readFile(routeFile);
      if (routeContent) {
        // 提取路由信息
        const routeMatches = routeContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
        if (routeMatches) {
          apiInfo.routes = routeMatches.map(match => match.replace(/path:\s*['"`]([^'"`]+)['"`]/, '$1'));
        }
      }
    } else {
      apiInfo.issues.push('路由目录存在但无文件');
    }
  } else {
    apiInfo.issues.push('缺少路由目录');
    analysisResults.missingRoutes++;
  }

  // 检查服务
  const servicePath = path.join(apiPath, 'services');
  if (fileExists(servicePath)) {
    const serviceFiles = fs.readdirSync(servicePath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    if (serviceFiles.length > 0) {
      apiInfo.hasService = true;
    } else {
      apiInfo.issues.push('服务目录存在但无文件');
    }
  } else {
    apiInfo.issues.push('缺少服务目录');
    analysisResults.missingServices++;
  }

  // 检查模型
  const modelPath = path.join(apiPath, 'content-types', apiName);
  if (fileExists(modelPath)) {
    const schemaFile = path.join(modelPath, 'schema.json');
    if (fileExists(schemaFile)) {
      apiInfo.hasModel = true;
    } else {
      apiInfo.issues.push('缺少schema.json文件');
    }
  } else {
    apiInfo.issues.push('缺少内容类型目录');
    analysisResults.missingModels++;
  }

  // 判断API是否有效
  const isValid = apiInfo.hasController && apiInfo.hasRoutes && apiInfo.hasModel;
  if (isValid) {
    analysisResults.validAPIs++;
  } else {
    analysisResults.invalidAPIs++;
  }

  analysisResults.apiDetails.push(apiInfo);
  return apiInfo;
}

// 分析所有API
function analyzeAllAPIs() {
  console.log(colors.blue('🔍 开始分析后端代码结构...'));
  console.log(colors.blue('='.repeat(60)));

  const srcPath = path.join(__dirname, 'src');
  const apiPath = path.join(srcPath, 'api');

  if (!fileExists(apiPath)) {
    console.log(colors.red('❌ 未找到API目录'));
    return;
  }

  const apiDirs = fs.readdirSync(apiPath).filter(dir => {
    const fullPath = path.join(apiPath, dir);
    return fs.statSync(fullPath).isDirectory() && !dir.startsWith('.');
  });

  console.log(colors.cyan(`📁 发现 ${apiDirs.length} 个API目录`));

  apiDirs.forEach(apiDir => {
    const fullPath = path.join(apiPath, apiDir);
    console.log(colors.yellow(`\n🔍 分析API: ${apiDir}`));
    
    const apiInfo = analyzeAPI(apiDir, fullPath);
    
    if (apiInfo.issues.length === 0) {
      console.log(colors.green(`   ✅ ${apiDir} - 结构完整`));
      console.log(colors.cyan(`      控制器方法: ${apiInfo.controllerMethods.join(', ') || '无'}`));
      console.log(colors.cyan(`      路由: ${apiInfo.routes.join(', ') || '无'}`));
    } else {
      console.log(colors.red(`   ❌ ${apiDir} - 存在问题`));
      apiInfo.issues.forEach(issue => {
        console.log(colors.red(`      - ${issue}`));
      });
    }
  });

  analysisResults.totalAPIs = apiDirs.length;
}

// 检查中间件
function analyzeMiddlewares() {
  console.log(colors.cyan('\n🛡️ 分析中间件...'));
  
  const middlewaresPath = path.join(__dirname, 'src', 'middlewares');
  if (fileExists(middlewaresPath)) {
    const middlewareFiles = fs.readdirSync(middlewaresPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    console.log(colors.green(`   发现 ${middlewareFiles.length} 个中间件文件`));
    middlewareFiles.forEach(file => {
      console.log(colors.cyan(`     - ${file}`));
    });
  } else {
    console.log(colors.yellow('   未找到中间件目录'));
  }
}

// 检查服务
function analyzeServices() {
  console.log(colors.cyan('\n⚙️ 分析服务...'));
  
  const servicesPath = path.join(__dirname, 'src', 'services');
  if (fileExists(servicesPath)) {
    const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    console.log(colors.green(`   发现 ${serviceFiles.length} 个服务文件`));
    serviceFiles.forEach(file => {
      console.log(colors.cyan(`     - ${file}`));
    });
  } else {
    console.log(colors.yellow('   未找到服务目录'));
  }
}

// 检查工具函数
function analyzeUtils() {
  console.log(colors.cyan('\n🛠️ 分析工具函数...'));
  
  const utilsPath = path.join(__dirname, 'src', 'utils');
  if (fileExists(utilsPath)) {
    const utilFiles = fs.readdirSync(utilsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    console.log(colors.green(`   发现 ${utilFiles.length} 个工具文件`));
    utilFiles.forEach(file => {
      console.log(colors.cyan(`     - ${file}`));
    });
  } else {
    console.log(colors.yellow('   未找到工具目录'));
  }
}

// 检查配置文件
function analyzeConfig() {
  console.log(colors.cyan('\n⚙️ 分析配置文件...'));
  
  const configPath = path.join(__dirname, 'config');
  if (fileExists(configPath)) {
    const configFiles = fs.readdirSync(configPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    console.log(colors.green(`   发现 ${configFiles.length} 个配置文件`));
    configFiles.forEach(file => {
      console.log(colors.cyan(`     - ${file}`));
    });
  } else {
    console.log(colors.yellow('   未找到配置目录'));
  }
}

// 检查数据库迁移
function analyzeMigrations() {
  console.log(colors.cyan('\n🗄️ 分析数据库迁移...'));
  
  const migrationsPath = path.join(__dirname, 'database', 'migrations');
  if (fileExists(migrationsPath)) {
    const migrationFiles = fs.readdirSync(migrationsPath).filter(file => file.endsWith('.js'));
    console.log(colors.green(`   发现 ${migrationFiles.length} 个迁移文件`));
    migrationFiles.forEach(file => {
      console.log(colors.cyan(`     - ${file}`));
    });
  } else {
    console.log(colors.yellow('   未找到迁移目录'));
  }
}

// 生成分析报告
function generateAnalysisReport() {
  console.log(colors.magenta('\n📊 代码分析报告'));
  console.log(colors.magenta('='.repeat(60)));
  
  console.log(colors.cyan(`总API数量: ${analysisResults.totalAPIs}`));
  console.log(colors.green(`有效API: ${analysisResults.validAPIs}`));
  console.log(colors.red(`无效API: ${analysisResults.invalidAPIs}`));
  
  const validRate = ((analysisResults.validAPIs / analysisResults.totalAPIs) * 100).toFixed(2);
  console.log(colors.cyan(`有效率: ${validRate}%`));
  
  console.log(colors.yellow(`\n缺失组件统计:`));
  console.log(colors.yellow(`  缺少控制器: ${analysisResults.missingControllers}`));
  console.log(colors.yellow(`  缺少路由: ${analysisResults.missingRoutes}`));
  console.log(colors.yellow(`  缺少服务: ${analysisResults.missingServices}`));
  console.log(colors.yellow(`  缺少模型: ${analysisResults.missingModels}`));
  
  // 保存详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalAPIs: analysisResults.totalAPIs,
      validAPIs: analysisResults.validAPIs,
      invalidAPIs: analysisResults.invalidAPIs,
      validRate: validRate
    },
    issues: {
      missingControllers: analysisResults.missingControllers,
      missingRoutes: analysisResults.missingRoutes,
      missingServices: analysisResults.missingServices,
      missingModels: analysisResults.missingModels
    },
    apiDetails: analysisResults.apiDetails
  };
  
  const reportPath = path.join(__dirname, `backend_analysis_report_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colors.cyan(`\n📄 详细报告已保存到: ${reportPath}`));
  
  // 生成修复建议
  console.log(colors.magenta('\n🔧 修复建议:'));
  if (analysisResults.missingControllers > 0) {
    console.log(colors.yellow('   - 为缺少控制器的API创建控制器文件'));
  }
  if (analysisResults.missingRoutes > 0) {
    console.log(colors.yellow('   - 为缺少路由的API创建路由文件'));
  }
  if (analysisResults.missingServices > 0) {
    console.log(colors.yellow('   - 为缺少服务的API创建服务文件'));
  }
  if (analysisResults.missingModels > 0) {
    console.log(colors.yellow('   - 为缺少模型的API创建内容类型定义'));
  }
}

// 主分析函数
function runAnalysis() {
  console.log(colors.blue('🚀 开始后端代码结构分析'));
  console.log(colors.blue('='.repeat(60)));
  
  try {
    analyzeAllAPIs();
    analyzeMiddlewares();
    analyzeServices();
    analyzeUtils();
    analyzeConfig();
    analyzeMigrations();
    generateAnalysisReport();
    
    console.log(colors.green('\n✅ 代码分析完成！'));
    
  } catch (error) {
    console.error(colors.red('分析过程中发生错误:'), error);
  }
}

// 运行分析
if (require.main === module) {
  runAnalysis();
}

module.exports = {
  runAnalysis,
  analyzeAPI,
  analysisResults
}; 