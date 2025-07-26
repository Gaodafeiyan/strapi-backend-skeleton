# 推荐奖励系统详细说明

## 📋 **推荐奖励系统概述**

您的系统实现了一个**基于投资金额的推荐奖励机制**，当被推荐人完成投资订单时，推荐人可以获得相应的USDT奖励。

## 🎯 **推荐奖励触发机制**

### 触发条件
- ✅ 被推荐人完成投资订单（订单状态为 `finished`）
- ✅ 被推荐人必须有上级推荐人
- ✅ 推荐人必须有已完成的投资订单

### 奖励计算逻辑

#### 1. **等级费率表**
```javascript
const RATE_TABLE = {
  500:  { static: 6, rebate: 100 },  // 500USDT以下：6% × 100%
  1000: { static: 7, rebate: 90  },  // 500-1000USDT：7% × 90%
  2000: { static: 8, rebate: 80  },  // 1000-2000USDT：8% × 80%
  5000: { static: 10, rebate: 70 },  // 2000USDT以上：10% × 70%
};
```

#### 2. **等级确定规则**
```javascript
function getTier(amount: number) {
  if (amount >= 5000) return 5000;  // 最高等级
  if (amount >= 2000) return 2000;  // 高级
  if (amount >= 1000) return 1000;  // 中级
  return 500;                        // 基础等级
}
```

#### 3. **奖励计算公式**
```
奖励金额 = min(推荐人总投资额, 被推荐人投资额) × 等级费率 × 返利比例 ÷ 10000
```

## 📊 **推荐奖励等级详解**

### 🥉 **基础等级（500USDT以下）**
- **费率**: 6%
- **返利比例**: 100%
- **实际奖励率**: 6% × 100% = 6%
- **适用条件**: 推荐人总投资额 < 500USDT

### 🥈 **中级等级（500-1000USDT）**
- **费率**: 7%
- **返利比例**: 90%
- **实际奖励率**: 7% × 90% = 6.3%
- **适用条件**: 500USDT ≤ 推荐人总投资额 < 1000USDT

### 🥇 **高级等级（1000-2000USDT）**
- **费率**: 8%
- **返利比例**: 80%
- **实际奖励率**: 8% × 80% = 6.4%
- **适用条件**: 1000USDT ≤ 推荐人总投资额 < 2000USDT

### 👑 **顶级等级（2000USDT以上）**
- **费率**: 10%
- **返利比例**: 70%
- **实际奖励率**: 10% × 70% = 7%
- **适用条件**: 推荐人总投资额 ≥ 2000USDT

## 🔄 **推荐奖励完整流程**

### 1. **触发时机**
```javascript
// 当被推荐人完成投资订单时触发
async createReferralReward(order: any) {
  const invitee = order.yonghu;        // 被推荐人
  const referrerId = invitee.shangji;  // 推荐人ID
}
```

### 2. **数据收集**
```javascript
// 获取推荐人所有已完成订单
const finishedOrders = await strapi.entityService.findMany(
  'api::dinggou-dingdan.dinggou-dingdan',
  {
    filters: { yonghu: referrerId, status: 'finished' },
    fields: ['amount'],
  }
);

// 计算推荐人总投资额
const aPrincipal = finishedOrders.reduce(
  (acc, o) => acc.plus(o.amount || 0),
  new Decimal(0)
);

// 被推荐人投资额
const bPrincipal = new Decimal(order.amount);
```

### 3. **等级和费率确定**
```javascript
const tier = getTier(aPrincipal.toNumber());
const { static: rate, rebate } = RATE_TABLE[tier];
```

### 4. **奖励计算**
```javascript
const reward = Decimal.min(aPrincipal, bPrincipal)
  .mul(rate)      // 乘以费率
  .mul(rebate)    // 乘以返利比例
  .div(10000);    // 除以10000（百分比转换）
```

### 5. **奖励发放**
```javascript
// 创建奖励记录
const rewardRecord = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
  data: {
    shouyiUSDT: rewardStr,      // 奖励金额
    tuijianRen: referrerId,     // 推荐人ID
    laiyuanRen: invitee.id,     // 被推荐人ID
    laiyuanDan: order.id,       // 来源订单ID
  },
});

// 更新推荐人钱包余额
const currentBalance = new Decimal(wallet.usdtYue || 0);
const newBalance = currentBalance.plus(reward).toFixed(2);
```

## 💰 **奖励计算示例**

### 示例1：基础等级奖励
```
推荐人总投资额：300USDT
被推荐人投资额：1000USDT
等级：基础等级（500USDT以下）
费率：6%，返利比例：100%

奖励计算：
min(300, 1000) × 6 × 100 ÷ 10000 = 300 × 6 × 100 ÷ 10000 = 18USDT
```

### 示例2：顶级等级奖励
```
推荐人总投资额：6000USDT
被推荐人投资额：2000USDT
等级：顶级等级（2000USDT以上）
费率：10%，返利比例：70%

奖励计算：
min(6000, 2000) × 10 × 70 ÷ 10000 = 2000 × 10 × 70 ÷ 10000 = 140USDT
```

### 示例3：不同等级对比
| 推荐人总投资额 | 等级 | 费率 | 返利比例 | 实际奖励率 | 1000USDT订单奖励 |
|---------------|------|------|----------|------------|------------------|
| 300USDT | 基础 | 6% | 100% | 6% | 60USDT |
| 800USDT | 中级 | 7% | 90% | 6.3% | 63USDT |
| 1500USDT | 高级 | 8% | 80% | 6.4% | 64USDT |
| 3000USDT | 顶级 | 10% | 70% | 7% | 70USDT |

## 📊 **推荐奖励数据结构**

### 数据库表结构
```sql
-- yaoqing_jiangli 表
shouyiUSDT: DECIMAL    -- 奖励USDT金额
tuijianRen: INTEGER    -- 推荐人ID
laiyuanRen: INTEGER    -- 被推荐人ID
laiyuanDan: INTEGER    -- 来源订单ID
```

### 关系映射
```javascript
// 推荐奖励记录
{
  id: 1,
  shouyiUSDT: "18.00",
  tuijianRen: { id: 1, username: "推荐人" },
  laiyuanRen: { id: 2, username: "被推荐人" },
  laiyuanDan: { id: 100, amount: "1000.00" }
}
```

## 🚀 **推荐奖励API接口**

### 1. 获取我的邀请记录
```http
GET /api/yaoqing-jianglis/my-invites
Authorization: Bearer <user-token>

响应示例：
{
  "data": [
    {
      "id": 1,
      "shouyiUSDT": "18.00",
      "laiyuanRen": {
        "id": 2,
        "username": "被推荐人"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. 获取邀请统计
```http
GET /api/yaoqing-jianglis/stats
Authorization: Bearer <user-token>

响应示例：
{
  "data": {
    "totalInvites": 5,
    "totalRewards": "125.50"
  }
}
```

## 🔒 **推荐奖励安全特性**

### 1. **事务处理**
- ✅ 使用数据库事务确保数据一致性
- ✅ 奖励记录和钱包更新原子操作
- ✅ 失败时自动回滚

### 2. **数据验证**
- ✅ 检查推荐人是否存在
- ✅ 验证被推荐人是否有上级
- ✅ 确保投资订单状态正确

### 3. **错误处理**
- ✅ 钱包不存在时的错误处理
- ✅ 奖励计算失败的回滚机制
- ✅ 详细的错误日志记录

## 📈 **推荐奖励系统优势**

### ✅ **激励性强**
- 多等级奖励机制
- 投资额越高，奖励率越高
- 实时奖励发放

### ✅ **公平合理**
- 基于实际投资金额计算
- 防止刷单和恶意操作
- 透明的计算规则

### ✅ **可扩展性**
- 灵活的等级配置
- 支持不同费率调整
- 完整的统计功能

## 🎯 **推荐奖励使用场景**

### 1. **新用户注册**
- 用户使用邀请码注册
- 建立推荐关系
- 等待投资触发奖励

### 2. **投资完成**
- 被推荐人完成投资
- 系统自动计算奖励
- 推荐人钱包余额增加

### 3. **奖励查询**
- 推荐人查看邀请记录
- 统计总奖励金额
- 监控推荐效果

## 📝 **总结**

您的推荐奖励系统是一个**功能完整、激励性强的推荐机制**：

✅ **多等级奖励** - 根据推荐人投资额确定不同奖励等级
✅ **实时发放** - 被推荐人完成投资时立即发放奖励
✅ **安全可靠** - 使用事务处理确保数据一致性
✅ **统计完整** - 提供详细的邀请记录和统计功能

这是一个设计合理、激励效果显著的推荐奖励系统！ 