const { exec } = require('child_process');

async function fixUserRelations() {
  try {
    console.log('=== 修复用户关系 ===');
    
    // 1. 检查当前抽奖机会数据
    console.log('\n1. 检查当前抽奖机会数据:');
    exec('sqlite3 .tmp/data.db "SELECT * FROM \"choujiang-jihui\";"', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 查询抽奖机会失败:', error);
        return;
      }
      console.log('抽奖机会数据:', stdout || '无数据');
      
      // 2. 检查用户关系
      console.log('\n2. 检查用户关系:');
      exec('sqlite3 .tmp/data.db "SELECT * FROM choujiang_jihui_yonghu_lnk;"', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ 查询用户关系失败:', error);
          return;
        }
        console.log('用户关系数据:', stdout || '无数据');
        
        // 3. 如果关系正确，检查抽奖记录创建问题
        console.log('\n3. 检查抽奖记录表结构:');
        exec('sqlite3 .tmp/data.db ".schema \"choujiang-ji-lu\""', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ 查询表结构失败:', error);
            return;
          }
          console.log('抽奖记录表结构:', stdout);
          
          // 4. 尝试手动创建正确的抽奖记录
          console.log('\n4. 尝试手动创建抽奖记录...');
          
          // 先删除可能存在的错误关系
          exec('sqlite3 .tmp/data.db "DELETE FROM choujiang_ji_lu_yonghu_lnk WHERE choujiang_ji_lu_id = 1;"', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ 删除错误关系失败:', error);
              return;
            }
            console.log('✅ 已删除错误的用户关系');
            
            // 创建正确的用户关系
            exec('sqlite3 .tmp/data.db "INSERT INTO choujiang_ji_lu_yonghu_lnk (choujiang_ji_lu_id, user_id) VALUES (1, 2);"', (error, stdout, stderr) => {
              if (error) {
                console.error('❌ 创建用户关系失败:', error);
                return;
              }
              console.log('✅ 已创建正确的用户关系');
              
              console.log('\n✅ 用户关系修复完成');
              console.log('现在可以重新测试抽奖功能');
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 修复用户关系失败:', error);
  }
}

fixUserRelations(); 