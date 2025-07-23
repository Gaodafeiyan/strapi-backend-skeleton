const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testUserRelations() {
  try {
    console.log('=== 测试用户关系 ===');
    
    // 连接数据库
    const dbPath = path.join(__dirname, '.tmp', 'data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('数据库路径:', dbPath);
    
    // 1. 检查用户是否存在
    console.log('\n1. 检查所有用户:');
    db.all("SELECT id, username, email FROM users", (err, users) => {
      if (err) {
        console.error('查询用户失败:', err);
        return;
      }
      console.log('所有用户:', users);
      
      // 2. 检查抽奖机会
      console.log('\n2. 检查所有抽奖机会:');
      db.all("SELECT * FROM choujiang_jihuis", (err, jihuis) => {
        if (err) {
          console.error('查询抽奖机会失败:', err);
          return;
        }
        console.log('所有抽奖机会:', jihuis);
        
        // 3. 检查抽奖记录
        console.log('\n3. 检查所有抽奖记录:');
        db.all("SELECT * FROM choujiang_ji_lus", (err, records) => {
          if (err) {
            console.error('查询抽奖记录失败:', err);
            return;
          }
          console.log('所有抽奖记录:', records);
          
          // 4. 检查用户ID 2的抽奖机会
          console.log('\n4. 检查用户ID 2的抽奖机会:');
          db.all("SELECT * FROM choujiang_jihuis WHERE yonghu_id = 2", (err, userJihuis) => {
            if (err) {
              console.error('查询用户抽奖机会失败:', err);
              return;
            }
            console.log('用户ID 2的抽奖机会:', userJihuis);
            
            db.close();
            console.log('\n测试完成');
          });
        });
      });
    });
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testUserRelations(); 