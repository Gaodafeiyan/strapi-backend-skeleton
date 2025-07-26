# AI代币实时价格换算功能说明

## 📊 **当前功能状态**

### ✅ **已支持的外部API价格源**

您的系统已经集成了多个外部API来获取实时价格：

1. **CoinGecko API** - 主流加密货币价格
   - 支持代币：Render (RNDR), Nosana (NOS), Synesis One (SNS), Numeraire (NMR), ChainGPT (CGPT)
   - API端点：`https://api.coingecko.com/api/v3/simple/price`

2. **Binance API** - 币安交易所价格
   - API端点：`https://api.binance.com/api/v3/ticker/price`

3. **DexScreener API** - DEX价格数据
   - API端点：`https://api.dexscreener.com/latest/dex/pairs/solana/`

### 🔄 **价格获取流程**

```javascript
// 价格获取逻辑
async getTokenPrice(tokenId) {
  const token = await getTokenInfo(tokenId);
  
  switch (token.price_source) {
    case 'coingecko':
      return await getCoinGeckoPrice(token.price_api_id);
    case 'binance':
      return await getBinancePrice(token.price_api_id);
    case 'dexscreener':
      return await getDexScreenerPrice(token.price_api_id);
    default:
      return 0.01; // 默认价格
  }
}
```

## 🆕 **新增的实时价格换算功能**

### 1. 基于USDT价值赠送代币

**接口**: `POST /api/token-reward-records/give-by-usdt-value`

**功能**: 根据USDT价值自动计算应赠送的代币数量

**请求示例**:
```http
POST /api/token-reward-records/give-by-usdt-value
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "userId": 1,
  "tokenId": 1,
  "usdtValue": "100",
  "reason": "投资奖励",
  "type": "investment"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "rewardRecord": { ... },
    "tokenAmount": "12.34567890",
    "usdtValue": "100",
    "tokenPrice": "8.10",
    "tokenSymbol": "RNDR"
  },
  "message": "代币赠送成功"
}
```

### 2. 批量基于USDT价值赠送代币

**接口**: `POST /api/token-reward-records/batch-give-by-usdt-value`

**功能**: 批量根据USDT价值赠送代币

**请求示例**:
```http
POST /api/token-reward-records/batch-give-by-usdt-value
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "rewards": [
    {
      "userId": 1,
      "tokenId": 1,
      "usdtValue": "100",
      "reason": "投资奖励",
      "type": "investment"
    },
    {
      "userId": 2,
      "tokenId": 2,
      "usdtValue": "50",
      "reason": "邀请奖励",
      "type": "invite"
    }
  ]
}
```

## 📈 **价格换算逻辑**

### 计算公式
```
代币数量 = USDT价值 / 代币实时价格
```

### 示例计算
- USDT价值：100 USDT
- RNDR实时价格：8.10 USDT
- 赠送代币数量：100 ÷ 8.10 = 12.34567890 RNDR

## 🔧 **技术实现细节**

### 1. 实时价格获取
```javascript
// 获取代币实时价格
let tokenPrice;
try {
  tokenPrice = await strapi.service('api::ai-token.ai-token').getTokenPrice(parseInt(tokenId));
} catch (priceError) {
  return ctx.badRequest('无法获取代币实时价格');
}
```

### 2. 精确计算
```javascript
// 使用Decimal.js确保精确计算
const usdtValueDecimal = new Decimal(usdtValue);
const priceDecimal = new Decimal(tokenPrice);
const tokenAmount = usdtValueDecimal.div(priceDecimal);
```

### 3. 记录详细信息
```javascript
// 创建奖励记录时保存价格信息
const rewardRecord = await strapi.entityService.create('api::token-reward-record.token-reward-record', {
  data: {
    user: userId,
    token: tokenId,
    amount: tokenAmount.toFixed(8),
    usdt_value: usdtValue,
    token_price: tokenPrice,
    reason: reason || 'USDT价值赠送',
    type: type,
    status: 'completed'
  }
});
```

## 🎯 **使用场景**

### 1. 投资奖励
- 用户投资1000 USDT
- 系统赠送价值100 USDT的AI代币
- 根据实时价格自动计算代币数量

### 2. 邀请奖励
- 用户邀请新用户注册
- 系统赠送价值50 USDT的AI代币
- 实时价格确保奖励价值准确

### 3. 活动奖励
- 参与特定活动
- 系统赠送价值200 USDT的AI代币
- 支持多种代币选择

## 🔒 **安全特性**

### 1. 价格验证
- 检查价格是否有效
- 设置价格范围限制
- 处理API调用失败

### 2. 精确计算
- 使用Decimal.js避免浮点数精度问题
- 保留8位小数精度
- 防止计算错误

### 3. 错误处理
- API调用超时处理
- 网络错误重试机制
- 降级到默认价格

## 📊 **API接口对比**

| 功能 | 接口 | 参数 | 特点 |
|------|------|------|------|
| 直接赠送 | `/api/token-reward-records/give` | `amount` | 直接指定代币数量 |
| USDT价值赠送 | `/api/token-reward-records/give-by-usdt-value` | `usdtValue` | 根据实时价格换算 |
| 批量直接赠送 | `/api/token-reward-records/batch-give` | `rewards[].amount` | 批量指定数量 |
| 批量USDT赠送 | `/api/token-reward-records/batch-give-by-usdt-value` | `rewards[].usdtValue` | 批量价格换算 |

## 🚀 **测试建议**

### 1. 测试实时价格获取
```bash
curl -X GET http://localhost:1337/api/ai-tokens/1/price
```

### 2. 测试USDT价值赠送
```bash
curl -X POST http://localhost:1337/api/token-reward-records/give-by-usdt-value \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "tokenId": 1,
    "usdtValue": "100",
    "reason": "测试USDT价值赠送"
  }'
```

### 3. 测试批量USDT价值赠送
```bash
curl -X POST http://localhost:1337/api/token-reward-records/batch-give-by-usdt-value \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rewards": [
      {
        "userId": 1,
        "tokenId": 1,
        "usdtValue": "100",
        "reason": "投资奖励"
      },
      {
        "userId": 2,
        "tokenId": 2,
        "usdtValue": "50",
        "reason": "邀请奖励"
      }
    ]
  }'
```

## 📝 **总结**

✅ **您的AI代币功能已经支持外部API实时价格**

✅ **新增了基于USDT价值的赠送功能**

✅ **支持实时价格换算**

✅ **完整的错误处理和精确计算**

现在您的系统可以：
- 获取代币实时价格
- 根据USDT价值自动计算代币数量
- 支持批量操作
- 记录详细的价格信息
- 确保奖励价值的准确性 