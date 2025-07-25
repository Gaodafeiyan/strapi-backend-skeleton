# 🚀 后端API接口完整文档

## 📋 接口概览

本后端系统包含以下主要功能模块的API接口：

### 🔐 认证相关接口
### 💰 钱包相关接口  
### 🎯 投资相关接口
### 🎰 抽奖相关接口
### 🛒 商城相关接口
### 📊 管理后台接口
### 🔧 系统监控接口

---

## 🔐 认证相关接口

### 1. 邀请注册
- **接口**: `POST /auth/invite-register`
- **描述**: 通过邀请码注册新用户
- **权限**: 无需认证
- **参数**: 
  ```json
  {
    "username": "用户名",
    "email": "邮箱",
    "password": "密码",
    "inviteCode": "邀请码"
  }
  ```

---

## 💰 钱包相关接口

### 2. 充值相关接口

#### 2.1 获取充值地址
- **接口**: `GET /qianbao-chongzhis/deposit-address`
- **描述**: 获取用户充值地址
- **权限**: 需要认证
- **参数**: 
  ```
  chain: 链类型 (BSC/ETH/TRON)
  asset: 资产类型 (USDT/AI_TOKEN)
  ```

#### 2.2 确认充值
- **接口**: `POST /qianbao-chongzhis/:id/confirm`
- **描述**: 确认充值记录
- **权限**: 需要认证

#### 2.3 充值记录管理
- **接口**: `GET /qianbao-chongzhis`
- **描述**: 获取充值记录列表
- **权限**: 需要认证

- **接口**: `GET /qianbao-chongzhis/:id`
- **描述**: 获取单个充值记录
- **权限**: 需要认证

- **接口**: `POST /qianbao-chongzhis`
- **描述**: 创建充值记录
- **权限**: 需要认证

- **接口**: `PUT /qianbao-chongzhis/:id`
- **描述**: 更新充值记录
- **权限**: 需要认证

- **接口**: `DELETE /qianbao-chongzhis/:id`
- **描述**: 删除充值记录
- **权限**: 需要认证

### 3. 提现相关接口

#### 3.1 提现记录管理
- **接口**: `GET /qianbao-tixians`
- **描述**: 获取提现记录列表
- **权限**: 需要认证

- **接口**: `GET /qianbao-tixians/:id`
- **描述**: 获取单个提现记录
- **权限**: 需要认证

- **接口**: `POST /qianbao-tixians`
- **描述**: 创建提现申请
- **权限**: 需要认证

- **接口**: `PUT /qianbao-tixians/:id`
- **描述**: 更新提现记录
- **权限**: 需要认证

- **接口**: `DELETE /qianbao-tixians/:id`
- **描述**: 删除提现记录
- **权限**: 需要认证

#### 3.2 广播提现
- **接口**: `POST /qianbao-tixians/:id/broadcast`
- **描述**: 广播提现交易
- **权限**: 需要认证

### 4. 钱包余额接口

#### 4.1 余额管理
- **接口**: `GET /qianbao-yues`
- **描述**: 获取钱包余额
- **权限**: 需要认证

- **接口**: `GET /qianbao-yues/:id`
- **描述**: 获取单个钱包余额
- **权限**: 需要认证

- **接口**: `POST /qianbao-yues`
- **描述**: 创建钱包余额记录
- **权限**: 需要认证

- **接口**: `PUT /qianbao-yues/:id`
- **描述**: 更新钱包余额
- **权限**: 需要认证

- **接口**: `DELETE /qianbao-yues/:id`
- **描述**: 删除钱包余额记录
- **权限**: 需要认证

### 5. 钱包地址管理

#### 5.1 地址管理
- **接口**: `GET /wallet-addresses`
- **描述**: 获取钱包地址列表
- **权限**: 需要认证

- **接口**: `GET /wallet-addresses/:id`
- **描述**: 获取单个钱包地址
- **权限**: 需要认证

- **接口**: `POST /wallet-addresses`
- **描述**: 创建钱包地址
- **权限**: 需要认证

- **接口**: `PUT /wallet-addresses/:id`
- **描述**: 更新钱包地址
- **权限**: 需要认证

- **接口**: `DELETE /wallet-addresses/:id`
- **描述**: 删除钱包地址
- **权限**: 需要认证

#### 5.2 地址操作
- **接口**: `GET /wallet-addresses/best/:chain/:asset`
- **描述**: 获取最佳充值地址
- **权限**: 需要认证

- **接口**: `POST /wallet-addresses/rotate`
- **描述**: 轮换地址
- **权限**: 需要认证

- **接口**: `POST /wallet-addresses/generate`
- **描述**: 生成新地址
- **权限**: 需要认证

---

## 🎯 投资相关接口

### 6. 投资计划接口

#### 6.1 计划管理
- **接口**: `GET /dinggou-jihuas`
- **描述**: 获取投资计划列表
- **权限**: 需要认证

- **接口**: `GET /dinggou-jihuas/:id`
- **描述**: 获取单个投资计划
- **权限**: 需要认证

- **接口**: `POST /dinggou-jihuas`
- **描述**: 创建投资计划
- **权限**: 需要认证

- **接口**: `PUT /dinggou-jihuas/:id`
- **描述**: 更新投资计划
- **权限**: 需要认证

- **接口**: `DELETE /dinggou-jihuas/:id`
- **描述**: 删除投资计划
- **权限**: 需要认证

### 7. 投资订单接口

#### 7.1 订单管理
- **接口**: `GET /dinggou-dingdans`
- **描述**: 获取投资订单列表
- **权限**: 需要认证

- **接口**: `GET /dinggou-dingdans/:id`
- **描述**: 获取单个投资订单
- **权限**: 需要认证

- **接口**: `POST /dinggou-dingdans`
- **描述**: 创建投资订单（带计划）
- **权限**: 需要认证

- **接口**: `PUT /dinggou-dingdans/:id`
- **描述**: 更新投资订单
- **权限**: 需要认证

- **接口**: `DELETE /dinggou-dingdans/:id`
- **描述**: 删除投资订单
- **权限**: 需要认证

#### 7.2 订单操作
- **接口**: `POST /dinggou-dingdans/:id/redeem`
- **描述**: 赎回投资订单
- **权限**: 需要认证

---

## 🎰 抽奖相关接口

### 8. 抽奖奖品接口

#### 8.1 奖品管理
- **接口**: `GET /choujiang-jiangpins`
- **描述**: 获取抽奖奖品列表
- **权限**: 需要认证

- **接口**: `GET /choujiang-jiangpins/:id`
- **描述**: 获取单个抽奖奖品
- **权限**: 需要认证

- **接口**: `POST /choujiang-jiangpins`
- **描述**: 创建抽奖奖品
- **权限**: 需要认证

- **接口**: `PUT /choujiang-jiangpins/:id`
- **描述**: 更新抽奖奖品
- **权限**: 需要认证

- **接口**: `DELETE /choujiang-jiangpins/:id`
- **描述**: 删除抽奖奖品
- **权限**: 需要认证

#### 8.2 奖品操作
- **接口**: `GET /choujiang-jiangpins/active`
- **描述**: 获取活跃奖品列表
- **权限**: 需要认证

### 9. 抽奖机会接口

#### 9.1 机会管理
- **接口**: `GET /choujiang-jihuis`
- **描述**: 获取抽奖机会列表
- **权限**: 需要认证

- **接口**: `GET /choujiang-jihuis/:id`
- **描述**: 获取单个抽奖机会
- **权限**: 需要认证

- **接口**: `POST /choujiang-jihuis`
- **描述**: 创建抽奖机会
- **权限**: 需要认证

- **接口**: `PUT /choujiang-jihuis/:id`
- **描述**: 更新抽奖机会
- **权限**: 需要认证

- **接口**: `DELETE /choujiang-jihuis/:id`
- **描述**: 删除抽奖机会
- **权限**: 需要认证

### 10. 抽奖记录接口

#### 10.1 记录管理
- **接口**: `GET /choujiang-ji-lus`
- **描述**: 获取抽奖记录列表
- **权限**: 需要认证

- **接口**: `GET /choujiang-ji-lus/:id`
- **描述**: 获取单个抽奖记录
- **权限**: 需要认证

- **接口**: `POST /choujiang-ji-lus`
- **描述**: 创建抽奖记录
- **权限**: 需要认证

- **接口**: `PUT /choujiang-ji-lus/:id`
- **描述**: 更新抽奖记录
- **权限**: 需要认证

- **接口**: `DELETE /choujiang-ji-lus/:id`
- **描述**: 删除抽奖记录
- **权限**: 需要认证

#### 10.2 抽奖操作
- **接口**: `POST /choujiang/perform`
- **描述**: 执行抽奖
- **权限**: 需要认证

- **接口**: `GET /choujiang/jihui`
- **描述**: 获取用户抽奖机会
- **权限**: 需要认证

- **接口**: `GET /choujiang/check-jihui`
- **描述**: 检查用户抽奖机会
- **权限**: 需要认证

- **接口**: `GET /choujiang/records`
- **描述**: 获取用户抽奖记录
- **权限**: 需要认证

- **接口**: `POST /choujiang/claim-prize`
- **描述**: 领取奖品
- **权限**: 需要认证

- **接口**: `GET /choujiang/prizes`
- **描述**: 获取抽奖奖品列表（公开）
- **权限**: 无需认证

- **接口**: `GET /choujiang/test-check`
- **描述**: 测试抽奖机会检查（管理员）
- **权限**: 管理员

---

## 🛒 商城相关接口

### 11. 商品接口

#### 11.1 商品管理
- **接口**: `GET /shop-products`
- **描述**: 获取商品列表
- **权限**: 需要认证

- **接口**: `GET /shop-products/:id`
- **描述**: 获取单个商品
- **权限**: 需要认证

- **接口**: `POST /shop-products`
- **描述**: 创建商品
- **权限**: 需要认证

- **接口**: `PUT /shop-products/:id`
- **描述**: 更新商品
- **权限**: 需要认证

- **接口**: `DELETE /shop-products/:id`
- **描述**: 删除商品
- **权限**: 需要认证

### 12. 购物车接口

#### 12.1 购物车管理
- **接口**: `GET /shop-carts`
- **描述**: 获取购物车列表
- **权限**: 需要认证

- **接口**: `GET /shop-carts/:id`
- **描述**: 获取单个购物车
- **权限**: 需要认证

- **接口**: `POST /shop-carts`
- **描述**: 创建购物车
- **权限**: 需要认证

- **接口**: `PUT /shop-carts/:id`
- **描述**: 更新购物车
- **权限**: 需要认证

- **接口**: `DELETE /shop-carts/:id`
- **描述**: 删除购物车
- **权限**: 需要认证

### 13. 订单接口

#### 13.1 订单管理
- **接口**: `GET /shop-orders`
- **描述**: 获取订单列表
- **权限**: 需要认证

- **接口**: `GET /shop-orders/:id`
- **描述**: 获取单个订单
- **权限**: 需要认证

- **接口**: `POST /shop-orders`
- **描述**: 创建订单
- **权限**: 需要认证

- **接口**: `PUT /shop-orders/:id`
- **描述**: 更新订单
- **权限**: 需要认证

- **接口**: `DELETE /shop-orders/:id`
- **描述**: 删除订单
- **权限**: 需要认证

---

## 📊 管理后台接口

### 14. 管理员仪表板接口

#### 14.1 仪表板管理
- **接口**: `GET /admin-dashboards`
- **描述**: 获取仪表板列表
- **权限**: 管理员

- **接口**: `GET /admin-dashboards/:id`
- **描述**: 获取单个仪表板
- **权限**: 管理员

- **接口**: `POST /admin-dashboards`
- **描述**: 创建仪表板
- **权限**: 管理员

- **接口**: `PUT /admin-dashboards/:id`
- **描述**: 更新仪表板
- **权限**: 管理员

- **接口**: `DELETE /admin-dashboards/:id`
- **描述**: 删除仪表板
- **权限**: 管理员

#### 14.2 系统管理
- **接口**: `GET /admin-dashboard/overview`
- **描述**: 获取系统概览数据
- **权限**: 管理员

- **接口**: `GET /admin-dashboard/users`
- **描述**: 获取用户管理数据
- **权限**: 管理员

- **接口**: `GET /admin-dashboard/orders`
- **描述**: 获取订单管理数据
- **权限**: 管理员

---

## 🔧 系统监控接口

### 15. 健康检查接口

#### 15.1 健康检查
- **接口**: `GET /health`
- **描述**: 基础健康检查
- **权限**: 无需认证

- **接口**: `GET /health/detailed`
- **描述**: 详细健康检查
- **权限**: 无需认证

### 16. Webhook接口

#### 16.1 交易处理
- **接口**: `POST /webhook/transaction`
- **描述**: 处理交易webhook
- **权限**: 无需认证
- **参数**:
  ```json
  {
    "txHash": "交易哈希",
    "status": "交易状态",
    "type": "交易类型"
  }
  ```

### 17. 性能监控接口

#### 17.1 性能监控
- **接口**: `GET /performance-monitors`
- **描述**: 获取性能监控数据
- **权限**: 需要认证

- **接口**: `GET /performance-monitors/:id`
- **描述**: 获取单个性能监控数据
- **权限**: 需要认证

- **接口**: `POST /performance-monitors`
- **描述**: 创建性能监控数据
- **权限**: 需要认证

- **接口**: `PUT /performance-monitors/:id`
- **描述**: 更新性能监控数据
- **权限**: 需要认证

- **接口**: `DELETE /performance-monitors/:id`
- **描述**: 删除性能监控数据
- **权限**: 需要认证

### 18. 缓存管理接口

#### 18.1 缓存操作
- **接口**: `GET /caches`
- **描述**: 获取缓存列表
- **权限**: 需要认证

- **接口**: `GET /caches/:id`
- **描述**: 获取单个缓存
- **权限**: 需要认证

- **接口**: `POST /caches`
- **描述**: 创建缓存
- **权限**: 需要认证

- **接口**: `PUT /caches/:id`
- **描述**: 更新缓存
- **权限**: 需要认证

- **接口**: `DELETE /caches/:id`
- **描述**: 删除缓存
- **权限**: 需要认证

### 19. 队列管理接口

#### 19.1 队列操作
- **接口**: `GET /queues`
- **描述**: 获取队列列表
- **权限**: 需要认证

- **接口**: `GET /queues/:id`
- **描述**: 获取单个队列
- **权限**: 需要认证

- **接口**: `POST /queues`
- **描述**: 创建队列
- **权限**: 需要认证

- **接口**: `PUT /queues/:id`
- **描述**: 更新队列
- **权限**: 需要认证

- **接口**: `DELETE /queues/:id`
- **描述**: 删除队列
- **权限**: 需要认证

### 20. 内部消息接口

#### 20.1 消息管理
- **接口**: `GET /internal-messages`
- **描述**: 获取内部消息列表
- **权限**: 需要认证

- **接口**: `GET /internal-messages/:id`
- **描述**: 获取单个内部消息
- **权限**: 需要认证

- **接口**: `POST /internal-messages`
- **描述**: 创建内部消息
- **权限**: 需要认证

- **接口**: `PUT /internal-messages/:id`
- **描述**: 更新内部消息
- **权限**: 需要认证

- **接口**: `DELETE /internal-messages/:id`
- **描述**: 删除内部消息
- **权限**: 需要认证

### 21. 公告接口

#### 21.1 公告管理
- **接口**: `GET /notices`
- **描述**: 获取公告列表
- **权限**: 需要认证

- **接口**: `GET /notices/:id`
- **描述**: 获取单个公告
- **权限**: 需要认证

- **接口**: `POST /notices`
- **描述**: 创建公告
- **权限**: 需要认证

- **接口**: `PUT /notices/:id`
- **描述**: 更新公告
- **权限**: 需要认证

- **接口**: `DELETE /notices/:id`
- **描述**: 删除公告
- **权限**: 需要认证

### 22. AI代币接口

#### 22.1 AI代币管理
- **接口**: `GET /ai-tokens`
- **描述**: 获取AI代币列表
- **权限**: 需要认证

- **接口**: `GET /ai-tokens/:id`
- **描述**: 获取单个AI代币
- **权限**: 需要认证

- **接口**: `POST /ai-tokens`
- **描述**: 创建AI代币
- **权限**: 需要认证

- **接口**: `PUT /ai-tokens/:id`
- **描述**: 更新AI代币
- **权限**: 需要认证

- **接口**: `DELETE /ai-tokens/:id`
- **描述**: 删除AI代币
- **权限**: 需要认证

### 23. 邀请奖励接口

#### 23.1 邀请奖励管理
- **接口**: `GET /yaoqing-jianglis`
- **描述**: 获取邀请奖励列表
- **权限**: 需要认证

- **接口**: `GET /yaoqing-jianglis/:id`
- **描述**: 获取单个邀请奖励
- **权限**: 需要认证

- **接口**: `POST /yaoqing-jianglis`
- **描述**: 创建邀请奖励
- **权限**: 需要认证

- **接口**: `PUT /yaoqing-jianglis/:id`
- **描述**: 更新邀请奖励
- **权限**: 需要认证

- **接口**: `DELETE /yaoqing-jianglis/:id`
- **描述**: 删除邀请奖励
- **权限**: 需要认证

### 24. 代币奖励记录接口

#### 24.1 代币奖励记录管理
- **接口**: `GET /token-reward-records`
- **描述**: 获取代币奖励记录列表
- **权限**: 需要认证

- **接口**: `GET /token-reward-records/:id`
- **描述**: 获取单个代币奖励记录
- **权限**: 需要认证

- **接口**: `POST /token-reward-records`
- **描述**: 创建代币奖励记录
- **权限**: 需要认证

- **接口**: `PUT /token-reward-records/:id`
- **描述**: 更新代币奖励记录
- **权限**: 需要认证

- **接口**: `DELETE /token-reward-records/:id`
- **描述**: 删除代币奖励记录
- **权限**: 需要认证

---

## 📝 接口测试说明

### 基础URL
```
http://localhost:1337/api
```

### 认证方式
- **Bearer Token**: 在请求头中添加 `Authorization: Bearer <token>`
- **无需认证**: 部分接口无需认证，可直接访问

### 响应格式
```json
{
  "data": "响应数据",
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 50
    }
  }
}
```

### 错误响应
```json
{
  "error": {
    "status": 400,
    "name": "BadRequest",
    "message": "错误信息"
  }
}
```

---

## 🚀 快速测试

### 1. 健康检查
```bash
curl http://localhost:1337/api/health
```

### 2. 获取抽奖奖品（公开接口）
```bash
curl http://localhost:1337/api/choujiang/prizes
```

### 3. 邀请注册
```bash
curl -X POST http://localhost:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "inviteCode": "INVITE123"
  }'
```

---

## 📊 接口统计

- **总接口数量**: 约 150+ 个接口
- **认证接口**: 约 140+ 个
- **公开接口**: 约 10+ 个
- **管理员接口**: 约 15+ 个

### 按功能模块分布：
- 🔐 认证相关: 1 个接口
- 💰 钱包相关: 25+ 个接口
- 🎯 投资相关: 15+ 个接口
- 🎰 抽奖相关: 20+ 个接口
- 🛒 商城相关: 15+ 个接口
- 📊 管理后台: 10+ 个接口
- 🔧 系统监控: 20+ 个接口
- 📢 其他功能: 40+ 个接口

---

*最后更新: 2024年12月* 