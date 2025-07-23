const { exec } = require('child_process');

async function simpleFix() {
  try {
    console.log('=== 简单修复用户关系 ===');
    
    // 1. 检查抽奖机会数据
    console.log('\n1. 检查抽奖机会数据:');
    exec('sqlite3 .tmp/data.db "SELECT id, zongCiShu, shengYuCiShu, zhuangtai FROM [choujiang-jihui];"', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 查询抽奖机会失败:', error);
        return;
      }
      console.log('抽奖机会数据:', stdout || '无数据');
      
      // 2. 检查抽奖记录
      console.log('\n2. 检查抽奖记录:');
      exec('sqlite3 .tmp/data.db "SELECT * FROM [choujiang-ji-lu];"', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ 查询抽奖记录失败:', error);
          return;
        }
        console.log('抽奖记录数据:', stdout || '无数据');
        
        // 3. 检查用户关系
        console.log('\n3. 检查用户关系:');
        exec('sqlite3 .tmp/data.db "SELECT * FROM choujiang_ji_lu_yonghu_lnk;"', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ 查询用户关系失败:', error);
            return;
          }
          console.log('用户关系数据:', stdout || '无数据');
          
          // 4. 如果抽奖记录存在但没有用户关系，创建关系
          if (stdout.trim() === '') {
            console.log('\n4. 创建用户关系...');
            exec('sqlite3 .tmp/data.db "INSERT INTO choujiang_ji_lu_yonghu_lnk (choujiang_ji_lu_id, user_id) VALUES (1, 2);"', (error, stdout, stderr) => {
              if (error) {
                console.error('❌ 创建用户关系失败:', error);
                return;
              }
              console.log('✅ 已创建用户关系');
            });
          } else {
            console.log('\n4. 用户关系已存在，检查是否正确...');
            // 检查关系是否正确
            if (stdout.includes('1|2')) {
              console.log('✅ 用户关系正确');
            } else {
              console.log('⚠️ 用户关系可能不正确，尝试修复...');
              exec('sqlite3 .tmp/data.db "DELETE FROM choujiang_ji_lu_yonghu_lnk WHERE choujiang_ji_lu_id = 1;"', (error, stdout, stderr) => {
                exec('sqlite3 .tmp/data.db "INSERT INTO choujiang_ji_lu_yonghu_lnk (choujiang_ji_lu_id, user_id) VALUES (1, 2);"', (error, stdout, stderr) => {
                  console.log('✅ 已修复用户关系');
                });
              });
            }
          }
          
          console.log('\n✅ 修复完成，现在可以测试抽奖功能');
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

simpleFix(); 