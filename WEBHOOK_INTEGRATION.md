# Webhook 自动确认 & 失败回滚功能

## 概述

本功能实现了区块链交易的自动确认和失败回滚机制，包括：

1. **Webhook 监听** - 统一处理转入/转出 txHash
2. **超时 Job** - 自动处理超时提现
3. **幂等保障** - 防止重复处理
4. **完整测试** - 单元和集成测试

## 功能特性

### 1. Webhook 统一处理

**端点**: `POST /api/webhook/transaction`

**请求格式**:
```json
{
  "txHash": "0xabc123...",
  "status": "success|failed",
  "type": "recharge|withdrawal"
}
```

**处理逻辑**:
- **充值确认**: `pending` → `success` 并增加用户余额
- **充值失败**: `pending` → `failed`
- **提现确认**: `broadcasted` → `success`
- **提现失败**: `broadcasted` → `failed` 并返还用户余额

### 2. 超时自动处理

**Cron 任务**: 每10分钟执行一次
**超时时间**: 30分钟
**处理逻辑**: 
- 扫描 `broadcasted` 状态超过30分钟的提现记录
- 自动标记为 `failed` 并返还用户余额

### 3. 幂等性保障

- 使用 `txHash` 作为唯一标识
- 已处理的交易不会重复处理
- 返回明确的错误信息

## API 使用示例

### 充值确认
```bash
curl -X POST http://localhost:1337/api/webhook/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xrecharge123",
    "status": "success",
    "type": "recharge"
  }'
```

### 提现确认
```bash
curl -X POST http://localhost:1337/api/webhook/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xwithdrawal456",
    "status": "success",
    "type": "withdrawal"
  }'
```

### 处理失败
```bash
curl -X POST http://localhost:1337/api/webhook/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xfailed789",
    "status": "failed",
    "type": "recharge"
  }'
```

## 状态流转

### 充值流程
```
pending → success (webhook确认)
pending → failed (webhook失败)
```

### 提现流程
```
pending → broadcasted (广播) → success (webhook确认)
pending → broadcasted (广播) → failed (webhook失败或超时)
```

## 测试

### 运行集成测试
```bash
node test-webhook-integration.js
```

### 运行单元测试
```bash
npm test tests/webhook.test.js
npm test tests/withdrawal-timeout.test.js
```

## 监控和日志

### 关键日志点
- 充值确认成功/失败
- 提现确认成功/失败
- 超时处理结果
- 余额变更记录

### 监控指标
- 处理成功率
- 超时记录数量
- 平均处理时间
- 错误率统计

## 配置

### 超时时间配置
在 `src/crons/withdrawal-timeout.ts` 中修改：
```typescript
const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // 30分钟
```

### Cron 频率配置
```typescript
cron: '*/10 * * * *' // 每10分钟
```

## 错误处理

### 常见错误
1. **缺少参数**: 400 Bad Request
2. **无效交易类型**: 400 Bad Request
3. **重复处理**: 400 Bad Request
4. **记录不存在**: 500 Internal Server Error
5. **余额不足**: 500 Internal Server Error

### 错误响应格式
```json
{
  "error": {
    "message": "错误描述"
  }
}
```

## 安全考虑

1. **Webhook 验证**: 建议添加签名验证
2. **IP 白名单**: 限制允许的调用方
3. **频率限制**: 防止恶意调用
4. **日志审计**: 记录所有操作

## 部署注意事项

1. 确保数据库连接稳定
2. 监控 cron 任务执行状态
3. 设置适当的日志级别
4. 配置错误告警机制
5. 定期备份重要数据

## 故障排查

### 常见问题
1. **Webhook 不响应**: 检查路由配置
2. **状态未更新**: 检查数据库连接
3. **余额计算错误**: 检查 Decimal.js 精度
4. **Cron 不执行**: 检查时间配置

### 调试命令
```bash
# 查看日志
tail -f logs/strapi.log

# 手动执行超时检查
curl -X POST http://localhost:1337/api/cron/withdrawal-timeout

# 检查数据库状态
curl -X GET http://localhost:1337/api/qianbao-tixians?filters[zhuangtai]=broadcasted
``` 