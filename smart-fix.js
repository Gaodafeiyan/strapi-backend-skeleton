const { exec } = require('child_process');

async function smartFix() {
  try {
    console.log('=== 智能修复用户关系 ===');
    
    // 1. 检查抽奖机会表结构
    console.log('\n1. 检查抽奖机会表结构:');
    exec('sqlite3 .tmp/data.db ".schema [choujiang-jihui]"', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 查询表结构失败:', error);
        return;
      }
      console.log('抽奖机会表结构:', stdout);
      
      // 2. 检查抽奖记录表结构
      console.log('\n2. 检查抽奖记录表结构:');
      exec('sqlite3 .tmp/data.db ".schema [choujiang-ji-lu]"', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ 查询表结构失败:', error);
          return;
        }
        console.log('抽奖记录表结构:', stdout);
        
        // 3. 查看所有数据
        console.log('\n3. 查看抽奖机会数据:');
        exec('sqlite3 .tmp/data.db "SELECT * FROM [choujiang-jihui];"', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ 查询数据失败:', error);
            return;
          }
          console.log('抽奖机会数据:', stdout || '无数据');
          
          // 4. 查看抽奖记录数据
          console.log('\n4. 查看抽奖记录数据:');
          exec('sqlite3 .tmp/data.db "SELECT * FROM [choujiang-ji-lu];"', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ 查询数据失败:', error);
              return;
            }
            console.log('抽奖记录数据:', stdout || '无数据');
            
            // 5. 查看用户关系
            console.log('\n5. 查看用户关系:');
            exec('sqlite3 .tmp/data.db "SELECT * FROM choujiang_ji_lu_yonghu_lnk;"', (error, stdout, stderr) => {
              if (error) {
                console.error('❌ 查询用户关系失败:', error);
                return;
              }
              console.log('用户关系数据:', stdout || '无数据');
              
              console.log('\n✅ 数据检查完成');
              console.log('请根据表结构信息确定正确的字段名');
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 智能修复失败:', error);
  }
}

smartFix(); 