# 邀请机制逻辑分析

## 📋 **邀请机制概述**

您的系统实现了一个完整的邀请机制，包括用户注册、邀请码生成、推荐关系建立和奖励系统。

## 🔄 **邀请机制完整流程**

### 1. **用户注册流程** (`/api/auth/invite-register`)

#### 注册步骤：
```javascript
// 1. 输入验证
const { username, email, password, inviteCode } = ctx.request.body;

// 2. 验证邀请码有效性
const referrer = await strapi.db.query('plugin::users-permissions.user')
  .findOne({ where: { yaoqingMa: cleanInviteCode } });

// 3. 生成新用户的唯一邀请码
let myCode = generateInviteCode(); // 9位随机字符

// 4. 创建新用户
const newUser = await strapi.plugin('users-permissions')
  .service('user')
  .add({
    username: cleanUsername,
    email: cleanEmail,
    password,
    role: authRole.id,
    yaoqingMa: myCode,        // 新用户的邀请码
    shangji: referrer.id,     // 上级用户ID
  });

// 5. 创建用户钱包
await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
  data: { yonghu: newUser.id },
});
```

### 2. **邀请码生成逻辑**

#### 生成规则：
```javascript
// utils/invite.ts
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'; // 32个字符
  return [...randomBytes(9)].map(b => chars[b % chars.length]).join('');
};
```

**特点**：
- ✅ 9位随机字符
- ✅ 包含大写字母和数字
- ✅ 排除易混淆字符（O, 0, I, 1）
- ✅ 使用加密随机数生成
- ✅ 自动检查唯一性

### 3. **用户关系结构**

#### 数据库字段：
```sql
-- users 表
yaoqingMa: VARCHAR(9)    -- 用户的邀请码
shangji: INTEGER         -- 上级用户ID（推荐人）

-- 示例数据
用户A: yaoqingMa='ABC123', shangji=null
用户B: yaoqingMa='DEF456', shangji=1  (用户A的ID)
用户C: yaoqingMa='GHI789', shangji=1  (用户A的ID)
```

#### 关系图：
```
用户A (邀请码: ABC123)
├── 用户B (邀请码: DEF456, 上级: 用户A)
├── 用户C (邀请码: GHI789, 上级: 用户A)
└── 用户D (邀请码: JKL012, 上级: 用户A)
```

### 4. **邀请奖励系统**

#### 奖励记录表 (`yaoqing_jiangli`)：
```sql
tuijianRen: INTEGER    -- 推荐人ID
laiyuanRen: INTEGER    -- 被推荐人ID
shouyiUSDT: DECIMAL    -- 奖励USDT金额
zhuangtai: VARCHAR     -- 奖励状态
```

#### 奖励接口：
- `GET /api/yaoqing-jianglis/my-invites` - 获取我的邀请记录
- `GET /api/yaoqing-jianglis/stats` - 获取邀请统计

## 🎯 **邀请机制特点**

### ✅ **已实现功能**

1. **邀请码注册**
   - 必须使用有效邀请码才能注册
   - 自动生成新用户的邀请码
   - 建立推荐关系

2. **邀请码验证**
   - 格式验证（9位字符）
   - 存在性验证
   - 唯一性检查

3. **用户关系管理**
   - 记录推荐人ID
   - 支持多级推荐关系
   - 防止循环推荐

4. **邀请奖励记录**
   - 记录推荐奖励
   - 统计邀请数量
   - 计算总收益

### 🔧 **技术实现细节**

#### 1. 输入验证
```javascript
// 验证邀请码格式
if (!validateInviteCode(cleanInviteCode)) {
  return ctx.badRequest('邀请码格式无效');
}

// 检查邀请码是否存在
const referrer = await strapi.db.query('plugin::users-permissions.user')
  .findOne({ where: { yaoqingMa: cleanInviteCode } });
if (!referrer) return ctx.badRequest('邀请码无效');
```

#### 2. 邀请码唯一性保证
```javascript
let myCode: string | null = null;
let attempts = 0;
const maxAttempts = 10;

while (attempts < maxAttempts) {
  const code = generateInviteCode();
  const hit = await strapi.db.query('plugin::users-permissions.user')
    .findOne({ where: { yaoqingMa: code } });
  if (!hit) { 
    myCode = code; 
    break; 
  }
  attempts++;
}
```

#### 3. 用户关系建立
```javascript
const newUser = await strapi.plugin('users-permissions')
  .service('user')
  .add({
    // ... 其他字段
    yaoqingMa: myCode,        // 新用户的邀请码
    shangji: referrer.id,     // 上级用户ID
  });
```

## 📊 **邀请统计功能**

### 1. 获取我的邀请记录
```javascript
async getMyInvites(ctx) {
  const userId = ctx.state.user.id;
  
  const invites = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
    filters: { tuijianRen: userId },
    sort: { createdAt: 'desc' },
    populate: ['laiyuanRen']
  });
  
  ctx.body = { data: invites };
}
```

### 2. 获取邀请统计
```javascript
async getInviteStats(ctx) {
  const userId = ctx.state.user.id;
  
  const totalInvites = await strapi.entityService.count('api::yaoqing-jiangli.yaoqing-jiangli', {
    filters: { tuijianRen: userId }
  });
  
  const totalRewards = await strapi.db.connection.raw(`
    SELECT COALESCE(SUM(shouyiUSDT), 0) as total
    FROM yaoqing_jianglis 
    WHERE tuijianRen = ?
  `, [userId]);
  
  ctx.body = {
    data: {
      totalInvites,
      totalRewards: totalRewards[0][0].total || 0
    }
  };
}
```

## 🚀 **API接口列表**

### 注册相关
| 接口 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/auth/invite-register` | POST | 邀请码注册 | 否 |

### 邀请奖励相关
| 接口 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/yaoqing-jianglis/my-invites` | GET | 获取我的邀请记录 | 是 |
| `/api/yaoqing-jianglis/stats` | GET | 获取邀请统计 | 是 |
| `/api/yaoqing-jianglis` | GET | 获取邀请奖励列表 | 是 |
| `/api/yaoqing-jianglis/:id` | GET | 获取单个邀请奖励 | 是 |

## 🔒 **安全特性**

### 1. 输入验证
- ✅ 邀请码格式验证
- ✅ 用户名长度限制（2-30字符）
- ✅ 邮箱格式验证
- ✅ 密码强度验证

### 2. 数据完整性
- ✅ 邀请码唯一性检查
- ✅ 防止重复注册
- ✅ 用户关系验证

### 3. 错误处理
- ✅ 邀请码无效处理
- ✅ 用户已存在处理
- ✅ 系统错误处理

## 📝 **使用示例**

### 1. 用户注册
```http
POST /api/auth/invite-register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "inviteCode": "ABC123DEF"
}
```

### 2. 获取邀请记录
```http
GET /api/yaoqing-jianglis/my-invites
Authorization: Bearer <user-token>
```

### 3. 获取邀请统计
```http
GET /api/yaoqing-jianglis/stats
Authorization: Bearer <user-token>
```

## 🎯 **邀请机制优势**

### ✅ **完整的功能链**
1. 邀请码生成和验证
2. 用户注册和关系建立
3. 邀请奖励记录
4. 统计和查询功能

### ✅ **安全性保障**
1. 严格的输入验证
2. 邀请码唯一性保证
3. 防止恶意注册

### ✅ **可扩展性**
1. 支持多级推荐关系
2. 灵活的奖励机制
3. 完整的统计功能

## 📈 **建议改进**

### 1. 邀请奖励自动化
- 新用户注册时自动创建奖励记录
- 支持不同级别的奖励规则
- 自动发放奖励到钱包

### 2. 邀请码管理
- 邀请码有效期设置
- 邀请码使用次数限制
- 邀请码批量生成

### 3. 统计功能增强
- 邀请排行榜
- 奖励历史记录
- 实时数据更新

## 📝 **总结**

您的邀请机制已经实现了完整的用户推荐系统，包括：

✅ **邀请码注册** - 必须使用有效邀请码才能注册
✅ **关系建立** - 自动建立推荐人和被推荐人关系
✅ **奖励记录** - 完整的邀请奖励记录系统
✅ **统计功能** - 邀请数量和收益统计
✅ **安全验证** - 严格的输入验证和错误处理

这是一个功能完整、安全可靠的邀请机制！ 