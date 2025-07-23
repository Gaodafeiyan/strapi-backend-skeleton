const fs = require('fs');
const path = require('path');

async function checkDatabase() {
  try {
    console.log('=== 检查数据库状态 ===');
    
    const dbPath = path.join(__dirname, '.tmp', 'data.db');
    
    if (!fs.existsSync(dbPath)) {
      console.log('❌ 数据库文件不存在:', dbPath);
      return;
    }
    
    console.log('✅ 数据库文件存在:', dbPath);
    
    // 检查数据库文件大小
    const stats = fs.statSync(dbPath);
    console.log('📊 数据库文件大小:', (stats.size / 1024).toFixed(2), 'KB');
    
    // 使用sqlite3命令行工具检查表
    const { exec } = require('child_process');
    
    console.log('\n=== 检查数据库表 ===');
    
    exec('sqlite3 .tmp/data.db ".tables"', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 执行sqlite3命令失败:', error);
        return;
      }
      
      console.log('📋 数据库表列表:');
      console.log(stdout);
      
      // 检查用户表
      exec('sqlite3 .tmp/data.db "SELECT name FROM sqlite_master WHERE type=\'table\' AND name LIKE \'%user%\';"', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ 查询用户表失败:', error);
          return;
        }
        
        console.log('\n👥 用户相关表:');
        console.log(stdout || '无用户相关表');
        
        // 检查抽奖相关表
        exec('sqlite3 .tmp/data.db "SELECT name FROM sqlite_master WHERE type=\'table\' AND name LIKE \'%choujiang%\';"', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ 查询抽奖表失败:', error);
            return;
          }
          
          console.log('\n🎰 抽奖相关表:');
          console.log(stdout || '无抽奖相关表');
          
          // 检查订单表
          exec('sqlite3 .tmp/data.db "SELECT name FROM sqlite_master WHERE type=\'table\' AND name LIKE \'%dingdan%\';"', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ 查询订单表失败:', error);
              return;
            }
            
            console.log('\n📦 订单相关表:');
            console.log(stdout || '无订单相关表');
            
            console.log('\n✅ 数据库检查完成');
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 检查数据库失败:', error);
  }
}

checkDatabase(); 