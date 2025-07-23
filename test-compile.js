const fs = require('fs');
const path = require('path');

console.log('🔍 开始检查关键文件是否存在...');

// 检查关键文件
const criticalFiles = [
  'src/api/dinggou-dingdan/services/dinggou-dingdan.ts',
  'src/api/qianbao-yue/services/qianbao-yue.ts',
  'src/api/yaoqing-jiangli/services/yaoqing-jiangli.ts',
  'src/api/choujiang-ji-lu/controllers/choujiang-ji-lu.ts',
  'src/api/choujiang-jihui/services/choujiang-jihui.ts',
  'src/middlewares/error-handler.ts',
  'src/utils/errors.ts',
  'src/utils/validation.ts',
  'database/migrations/2024_01_01_000000_add_performance_indexes.js'
];

let allFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

console.log('\n🔍 检查package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`✅ package.json 存在，版本: ${packageJson.version}`);
  console.log(`✅ 依赖项数量: ${Object.keys(packageJson.dependencies || {}).length}`);
} else {
  console.log('❌ package.json 不存在');
  allFilesExist = false;
}

console.log('\n🔍 检查TypeScript配置...');
const tsConfigPath = path.join(__dirname, 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  console.log('✅ tsconfig.json 存在');
} else {
  console.log('❌ tsconfig.json 不存在');
}

console.log('\n🔍 检查Strapi配置...');
const configFiles = [
  'config/middlewares.ts',
  'config/database.ts',
  'config/server.ts'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
  }
});

console.log('\n📊 检查结果总结:');
if (allFilesExist) {
  console.log('✅ 所有关键文件都存在');
  console.log('✅ 可以尝试编译');
} else {
  console.log('❌ 部分关键文件缺失');
  console.log('❌ 需要先修复缺失文件');
}

console.log('\n💡 建议:');
console.log('1. 如果所有文件都存在，可以运行: npm run build');
console.log('2. 如果有TypeScript错误，需要先修复');
console.log('3. 修复后可以运行: npm run develop 启动开发服务器'); 