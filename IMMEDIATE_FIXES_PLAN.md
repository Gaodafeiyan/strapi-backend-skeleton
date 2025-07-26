# 立即修复计划

## 🚨 优先级：立即修复

### 1. 修复AI代币模块字段不匹配问题

#### 问题描述
代码中使用下划线命名法，但Schema使用驼峰命名法，导致数据库查询失败。

#### 修复步骤

**步骤1: 更新AI代币Schema**
```typescript
// src/api/ai-token/content-types/ai-token/schema.ts
const AiTokenSchema = {
  // ... 其他配置
  attributes: {
    name: { type: 'string', required: true, unique: true, maxLength: 100 },
    symbol: { type: 'string', required: true, unique: true, maxLength: 20 },
    // 修改为下划线命名法，与代码保持一致
    contract_address: { 
      type: 'string',
      maxLength: 100,
      description: '合约地址 (SPL Token Address)'
    },
    price_source: { 
      type: 'enumeration',
      enum: ['coingecko', 'binance', 'dexscreener'],
      required: true,
      description: '价格数据源'
    },
    price_api_id: { 
      type: 'string',
      maxLength: 100,
      description: 'API中的代币ID或符号'
    },
    weight: { 
      type: 'integer',
      default: 20,
      min: 1,
      max: 100,
      description: '权重(影响被选中概率)'
    },
    is_active: { 
      type: 'boolean',
      default: true,
      description: '是否启用'
    },
    logo_url: { 
      type: 'string',
      maxLength: 255,
      description: '代币图标URL'
    },
    description: { 
      type: 'text',
      description: '代币描述'
    },
  },
};
```

**步骤2: 更新AI代币服务代码**
```typescript
// src/api/ai-token/services/ai-token.ts
// 修改字段访问方式
const { price_source, price_api_id } = token;
```

### 2. 修复订单状态枚举不匹配问题

#### 问题描述
定时任务使用 `redeemable` 状态，但Schema中未定义此枚举值。

#### 修复步骤

**步骤1: 更新订单Schema**
```typescript
// src/api/dinggou-dingdan/content-types/dinggou-dingdan/schema.ts
const DingdanSchema = {
  // ... 其他配置
  attributes: {
    // ... 其他字段
    status: { 
      type: 'enumeration', 
      enum: ['pending', 'running', 'finished', 'cancelled', 'redeemable'], 
      default: 'pending' 
    },
  },
};
```

**步骤2: 更新定时任务**
```typescript
// src/crons/check-orders.ts
// 确保状态值在枚举范围内
await strapi.entityService.update(
  'api::dinggou-dingdan.dinggou-dingdan',
  order.id,
  { data: { status: 'finished' } as any } // 改为 'finished' 而不是 'redeemable'
);
```

### 3. 完善路由配置

#### 问题描述
路由索引文件不完整，缺少重要模块的路由导出。

#### 修复步骤

**更新路由索引文件**
```typescript
// src/api/routes.ts
export default {
  // 钱包路由
  'qianbao-yue': () => import('./qianbao-yue/routes/qianbao-yue'),
  // AI代币路由
  'ai-token': () => import('./ai-token/routes/ai-token'),
  // 认购计划路由
  'dinggou-jihua': () => import('./dinggou-jihua/routes/dinggou-jihua'),
  // 认购订单路由
  'dinggou-dingdan': () => import('./dinggou-dingdan/routes/dinggou-dingdan'),
  // 抽奖机会路由
  'choujiang-jihui': () => import('./choujiang-jihui/routes/choujiang-jihui'),
  // 抽奖记录路由
  'choujiang-ji-lu': () => import('./choujiang-ji-lu/routes/choujiang-ji-lu'),
  // 抽奖奖品路由
  'choujiang-jiangpin': () => import('./choujiang-jiangpin/routes/choujiang-jiangpin'),
  // 通知路由
  'notice': () => import('./notice/routes/notice'),
  // 健康检查路由
  'health': () => import('./health/routes/health'),
};
```

### 4. 创建数据库迁移文件

#### 问题描述
缺少数据库结构初始化脚本。

#### 修复步骤

**创建初始迁移文件**
```sql
-- database/migrations/001_initial_schema.sql
-- 创建AI代币表
CREATE TABLE IF NOT EXISTS ai_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  contract_address VARCHAR(100),
  price_source ENUM('coingecko', 'binance', 'dexscreener') NOT NULL,
  price_api_id VARCHAR(100),
  weight INT DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  logo_url VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建钱包余额表
CREATE TABLE IF NOT EXISTS qianbao_yues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usdt_yue DECIMAL(20,8) DEFAULT '0',
  ai_yue DECIMAL(20,8) DEFAULT '0',
  ai_token_balances JSON DEFAULT '{}',
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建认购计划表
CREATE TABLE IF NOT EXISTS dinggou_jihuas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  max_slots INT DEFAULT 100,
  current_slots INT DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  description TEXT,
  jingtai_bili DECIMAL(10,4) NOT NULL,
  ai_bili DECIMAL(10,4) NOT NULL,
  zhou_qi_tian INT NOT NULL,
  kaiqi BOOLEAN DEFAULT TRUE,
  lottery_chances INT DEFAULT 0,
  lottery_prize_id INT,
  jihua_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建认购订单表
CREATE TABLE IF NOT EXISTS dinggou_dingdans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  jihua_id INT,
  amount DECIMAL(20,8) NOT NULL,
  principal DECIMAL(20,8) NOT NULL,
  yield_rate DECIMAL(10,4) NOT NULL,
  cycle_days INT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  redeemed_at DATETIME,
  payout_amount DECIMAL(20,8),
  status ENUM('pending', 'running', 'finished', 'cancelled', 'redeemable') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jihua_id) REFERENCES dinggou_jihuas(id) ON DELETE CASCADE
);

-- 插入初始AI代币数据
INSERT INTO ai_tokens (name, symbol, contract_address, price_source, price_api_id, weight, description, is_active) VALUES
('Render', 'RNDR', 'RNDR1A97ZatuqTAT2bZn1r4KwQisLvVfwJQfqWwaCSm', 'coingecko', 'render-token', 30, 'Render Network - 去中心化GPU渲染网络', TRUE),
('Nosana', 'NOS', '4BC2PiK9Y319bPQKHbLbHu86xdksJLAuBTBDPc6QcKAS', 'coingecko', 'nosana', 25, 'Nosana - 去中心化CI/CD平台', TRUE),
('Synesis One', 'SNS', 'SNS5czn4ZyjtHNpgJyHCN33zBYFWvLJoYxx3JrqkjvGc', 'coingecko', 'synesis-one', 20, 'Synesis One - AI数据标注平台', TRUE),
('Numeraire', 'NMR', 'NMR1gd2nautLcWTPZLY625YCHP6oVVNqs8s4ET3SkMsv', 'coingecko', 'numerai', 15, 'Numeraire - 去中心化对冲基金', TRUE),
('ChainGPT', 'CGPT', 'CGPT1Ws3jh9E82fUmX9Zykp17fjM5pVp4SGbXw7U7Doo', 'coingecko', 'chaingpt', 10, 'ChainGPT - AI驱动的区块链工具', TRUE);
```

### 5. 修复类型安全问题

#### 问题描述
代码中频繁使用 `as any` 类型断言，存在类型安全风险。

#### 修复步骤

**创建类型定义文件**
```typescript
// types/api.d.ts
export interface QianbaoYue {
  id: number;
  usdtYue: string;
  aiYue: string;
  aiTokenBalances: string;
  user: number;
  createdAt: string;
  updatedAt: string;
}

export interface DinggouJihua {
  id: number;
  name: string;
  maxSlots: number;
  currentSlots: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  jingtaiBili: string;
  aiBili: string;
  zhouQiTian: number;
  kaiqi: boolean;
  lotteryChances: number;
  lotteryPrizeId?: number;
  jihuaCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DinggouDingdan {
  id: number;
  user: number;
  jihua: number;
  amount: string;
  principal: string;
  yieldRate: string;
  cycleDays: number;
  startAt: string;
  endAt: string;
  redeemedAt?: string;
  payoutAmount?: string;
  status: 'pending' | 'running' | 'finished' | 'cancelled' | 'redeemable';
  createdAt: string;
  updatedAt: string;
}
```

**更新控制器代码**
```typescript
// src/api/qianbao-yue/controllers/qianbao-yue.ts
// 移除 as any，使用正确的类型
const wallet = wallets[0] as QianbaoYue;
```

## 🎯 执行顺序

1. **第一步**: 修复AI代币字段不匹配问题
2. **第二步**: 修复订单状态枚举问题
3. **第三步**: 完善路由配置
4. **第四步**: 创建数据库迁移
5. **第五步**: 修复类型安全问题

## ⚠️ 注意事项

1. 修复前请备份数据库
2. 测试环境先验证修复效果
3. 确保所有依赖的服务正常运行
4. 监控修复后的系统性能

## 📊 预期效果

- 数据库查询正常
- API路由可正常访问
- 类型安全得到保障
- 系统稳定性提升 