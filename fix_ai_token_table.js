const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '.tmp', 'data.db');

// 创建AI代币表的SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS ai_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  weight REAL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 插入示例数据
const insertDataSQL = `
INSERT OR IGNORE INTO ai_tokens (name, symbol, description, weight, is_active) VALUES
('Bitcoin', 'BTC', '比特币', 1.0, 1),
('Ethereum', 'ETH', '以太坊', 0.8, 1),
('Binance Coin', 'BNB', '币安币', 0.6, 1),
('Cardano', 'ADA', '卡尔达诺', 0.4, 1),
('Solana', 'SOL', '索拉纳', 0.5, 1);
`;

async function fixAITokenTable() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 连接数据库失败:', err.message);
        reject(err);
        return;
      }
      console.log('✅ 成功连接到数据库');
    });

    // 创建表
    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('❌ 创建表失败:', err.message);
        reject(err);
        return;
      }
      console.log('✅ AI代币表创建成功');
    });

    // 插入数据
    db.run(insertDataSQL, (err) => {
      if (err) {
        console.error('❌ 插入数据失败:', err.message);
        reject(err);
        return;
      }
      console.log('✅ 示例数据插入成功');
    });

    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('❌ 关闭数据库失败:', err.message);
        reject(err);
        return;
      }
      console.log('✅ 数据库连接已关闭');
      resolve();
    });
  });
}

// 运行修复
fixAITokenTable()
  .then(() => {
    console.log('🎉 AI代币表修复完成！');
  })
  .catch((error) => {
    console.error('❌ 修复失败:', error);
  }); 