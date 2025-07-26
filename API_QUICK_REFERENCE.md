# API接口快速参考

## 基础信息
- **基础URL**: `http://localhost:1337/api`
- **认证方式**: JWT Token (Bearer Token)
- **数据格式**: JSON

## 认证相关

### 用户注册
```http
POST /api/auth/invite-register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "inviteCode": "ABC123DEF"
}
```

## 钱包相关

### 获取用户钱包
```http
GET /api/qianbao-yues/user-wallet
Authorization: Bearer <token>
```

### 获取代币余额
```http
GET /api/qianbao-yues/token-balances
Authorization: Bearer <token>
```

### 获取代币奖励记录
```http
GET /api/qianbao-yues/token-reward-records
Authorization: Bearer <token>
```

## AI代币相关

### 获取所有代币
```http
GET /api/ai-tokens
```

### 获取活跃代币
```http
GET /api/ai-tokens/active
```

### 获取代币价格
```http
GET /api/ai-tokens/{id}/price
```

### 批量获取代币价格
```http
GET /api/ai-tokens/prices/batch
```

### 获取市场数据
```http
GET /api/ai-tokens/market-data
```

## 投资计划相关

### 获取活跃投资计划
```http
GET /api/dinggou-jihuas/active
```

### 获取所有投资计划
```http
GET /api/dinggou-jihuas
```

### 创建投资计划
```http
POST /api/dinggou-jihuas
Content-Type: application/json

{
  "data": {
    "name": "30天投资计划",
    "amount": "1000",
    "yield_rate": "0.15",
    "cycle_days": 30,
    "max_slots": 100,
    "description": "30天投资计划，年化收益率15%"
  }
}
```

## 投资订单相关

### 获取订单列表
```http
GET /api/dinggou-dingdans
Authorization: Bearer <token>
```

### 创建投资订单
```http
POST /api/dinggou-dingdans
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "jihua": 1,
    "touziJinE": "1000",
    "yonghu": 1
  }
}
```

## 提现相关

### 获取提现记录
```http
GET /api/qianbao-tixians
Authorization: Bearer <token>
```

### 创建提现申请
```http
POST /api/qianbao-tixians
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "amount": "100",
    "to_address": "0x1234567890abcdef..."
  }
}
```

## 抽奖相关

### 获取抽奖机会
```http
GET /api/choujiang-jihuis
Authorization: Bearer <token>
```

### 获取抽奖奖品
```http
GET /api/choujiang-jiangpins
```

### 获取抽奖记录
```http
GET /api/choujiang-ji-lus
Authorization: Bearer <token>
```

## 商城相关

### 获取商品列表
```http
GET /api/shop-products
```

### 获取购物车
```http
GET /api/shop-carts
Authorization: Bearer <token>
```

### 获取订单列表
```http
GET /api/shop-orders
Authorization: Bearer <token>
```

## 通知相关

### 获取通知列表
```http
GET /api/notices
```

### 创建通知
```http
POST /api/notices
Content-Type: application/json

{
  "data": {
    "title": "系统维护通知",
    "content": "系统将于今晚进行维护",
    "type": "maintenance"
  }
}
```

## 系统相关

### 健康检查
```http
GET /api/health
```

### 钱包连接测试
```http
GET /api/qianbao-yues/test
```

## 通用CRUD操作

所有模块都支持标准的CRUD操作：

### 获取列表
```http
GET /api/{module-name}
```

### 获取单个记录
```http
GET /api/{module-name}/{id}
```

### 创建记录
```http
POST /api/{module-name}
Content-Type: application/json

{
  "data": {
    // 字段数据
  }
}
```

### 更新记录
```http
PUT /api/{module-name}/{id}
Content-Type: application/json

{
  "data": {
    // 更新的字段
  }
}
```

### 删除记录
```http
DELETE /api/{module-name}/{id}
```

## 查询参数

### 分页
```http
GET /api/{module-name}?pagination[page]=1&pagination[pageSize]=10
```

### 排序
```http
GET /api/{module-name}?sort=createdAt:desc
```

### 过滤
```http
GET /api/{module-name}?filters[status][$eq]=active
```

### 关联查询
```http
GET /api/{module-name}?populate=*
```

## 错误响应格式

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "错误描述",
    "details": {}
  }
}
```

## 成功响应格式

```json
{
  "data": {
    // 数据内容
  },
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

## 认证头格式

```http
Authorization: Bearer <your-jwt-token>
```

## 常用状态码

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器错误

## 环境变量配置

```bash
# 数据库配置
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# 服务器配置
HOST=0.0.0.0
PORT=1337

# JWT密钥
JWT_SECRET=your-jwt-secret

# Redis配置 (队列系统)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 开发工具

### 启动开发服务器
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

### 访问管理后台
```
http://localhost:1337/admin
``` 