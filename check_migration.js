const { exec } = require('child_process');

async function checkMigration() {
  console.log('🔍 检查数据库迁移状态...\n');

  const commands = [
    'npm run strapi database:migrate',
    'npm run strapi database:seed',
    'npm run strapi ts:generate-types'
  ];

  for (const command of commands) {
    try {
      console.log(`执行: ${command}`);
      await new Promise((resolve, reject) => {
        exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
          if (error) {
            console.log(`❌ 执行失败: ${error.message}`);
            reject(error);
          } else {
            console.log(`✅ 执行成功`);
            if (stdout) console.log(stdout);
            resolve();
          }
        });
      });
    } catch (error) {
      console.log(`⚠️ 跳过此步骤: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 数据库迁移检查完成');
}

checkMigration().catch(console.error); 