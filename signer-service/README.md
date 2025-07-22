# Withdrawal Signer Service

自动提现签名服务，处理区块链USDT转账交易。

## 功能特性

- 🔐 **安全签名**: 使用热钱包私钥签名USDT转账交易
- 📋 **队列处理**: 基于Redis + BullMQ的异步任务处理
- 🔄 **自动重试**: 失败任务自动重试机制
- 📊 **状态监控**: 实时队列状态和交易状态监控
- 🛡️ **错误处理**: 完善的错误处理和余额回滚机制
- 🌐 **HTTP API**: RESTful API接口

## 架构流程

```
提现请求 → 队列任务 → 签名 → 广播 → 确认 → 完成
   ↓         ↓        ↓      ↓      ↓      ↓
  Strapi   Redis   Ethers  RPC   检查   更新状态
```

## 安装部署

### 1. 安装依赖

```bash
cd signer-service
npm install
```

### 2. 配置环境变量

复制环境变量文件：
```bash
cp env.example .env
```

编辑 `.env` 文件：
```env
# Redis配置
REDIS_URL=redis://127.0.0.1:6379

# 区块链配置
RPC_URL=https://bsc-dataseed1.binance.org/
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
HOT_WALLET_PRIVATE_KEY=your_private_key_here
HOT_WALLET_ADDRESS=your_wallet_address_here

# Strapi API配置
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here

# 服务配置
SIGNER_SERVICE_PORT=3001
LOG_LEVEL=info

# 安全配置
MAX_WITHDRAWAL_AMOUNT=10000
MIN_WITHDRAWAL_AMOUNT=1
```

### 3. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API接口

### 健康检查
```
GET /health
```

### 队列状态
```
GET /api/queue/status
```

### 清理队列
```
POST /api/queue/clean
```

### 手动处理提现
```
POST /api/withdrawal/process
Content-Type: application/json

{
  "withdrawId": 123
}
```

### 服务信息
```
GET /api/info
```

## 队列任务类型

### 1. sign - 签名任务
- 验证提现记录
- 签名USDT转账交易
- 创建广播任务

### 2. broadcast - 广播任务
- 广播签名交易到区块链
- 更新提现状态为已广播
- 创建确认任务

### 3. confirm - 确认任务
- 检查交易确认状态
- 更新最终状态
- 发送Webhook通知

## 错误处理

### 签名失败
- 更新提现状态为失败
- 返还用户余额

### 广播失败
- 更新提现状态为失败
- 返还用户余额

### 交易失败
- 更新提现状态为失败
- 记录交易哈希
- 返还用户余额

## 监控日志

服务使用Winston进行日志记录：

- **错误日志**: `logs/error.log`
- **完整日志**: `logs/combined.log`
- **控制台输出**: 开发环境

## 安全注意事项

1. **私钥安全**: 确保热钱包私钥安全存储
2. **网络隔离**: 建议在独立网络中运行
3. **访问控制**: 限制API访问权限
4. **监控告警**: 设置关键指标监控

## 部署建议

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2部署
```bash
pm2 start npm --name "withdraw-signer" -- start
pm2 save
pm2 startup
```

## 故障排除

### 常见问题

1. **Redis连接失败**
   - 检查Redis服务状态
   - 验证连接URL

2. **私钥错误**
   - 检查私钥格式
   - 验证钱包地址

3. **RPC连接失败**
   - 检查网络连接
   - 验证RPC URL

4. **Strapi API错误**
   - 检查API URL
   - 验证API Token

## 开发

### 运行测试
```bash
npm test
```

### 代码检查
```bash
npm run lint
```

## 许可证

MIT License 