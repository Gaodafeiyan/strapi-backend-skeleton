# 后端代码和API接口完整分析报告

## 项目概述

这是一个基于Strapi框架构建的后端API系统，主要功能包括：
- 用户认证和注册系统
- 钱包管理系统
- AI代币交易系统
- 投资认购计划
- 抽奖系统
- 提现系统
- 商城系统
- 通知系统

## 技术栈

- **框架**: Strapi 5.18.1
- **数据库**: SQLite (默认), 支持MySQL/PostgreSQL
- **队列系统**: BullMQ + Redis
- **数值计算**: Decimal.js
- **HTTP客户端**: Axios
- **语言**: TypeScript

## 项目结构

```
strapi-backend-skeleton/
├── src/
│   ├── api/                    # API模块
│   │   ├── auth/              # 认证模块
│   │   ├── qianbao-yue/       # 钱包余额
│   │   ├── qianbao-tixian/    # 钱包提现
│   │   ├── qianbao-chongzhi/  # 钱包充值
│   │   ├── ai-token/          # AI代币
│   │   ├── dinggou-jihua/     # 认购计划
│   │   ├── dinggou-dingdan/   # 认购订单
│   │   ├── choujiang-jihui/   # 抽奖机会
│   │   ├── choujiang-jiangpin/# 抽奖奖品
│   │   ├── choujiang-ji-lu/   # 抽奖记录
│   │   ├── shop-product/       # 商城商品
│   │   ├── shop-cart/         # 购物车
│   │   ├── shop-order/        # 商城订单
│   │   ├── notice/            # 通知公告
│   │   ├── webhook/           # Webhook
│   │   └── health/            # 健康检查
│   ├── services/              # 服务层
│   ├── middlewares/           # 中间件
│   ├── utils/                 # 工具函数
│   ├── queues/                # 队列系统
│   └── crons/                 # 定时任务
├── config/                    # 配置文件
└── database/                  # 数据库迁移
```

## API接口详细分析

### 1. 认证模块 (auth)

**路由**: `/api/auth/`

#### 接口列表:
- `POST /api/auth/invite-register` - 邀请码注册
  - 功能: 用户通过邀请码注册
  - 参数: `{ username, email, password, inviteCode }`
  - 返回: `{ success, userId, message, inviteCode }`

### 2. 钱包模块 (qianbao-yue)

**路由**: `/api/qianbao-yues/`

#### 接口列表:
- `GET /api/qianbao-yues` - 获取钱包列表
- `GET /api/qianbao-yues/:id` - 获取指定钱包
- `POST /api/qianbao-yues` - 创建钱包
- `PUT /api/qianbao-yues/:id` - 更新钱包
- `DELETE /api/qianbao-yues/:id` - 删除钱包
- `GET /api/qianbao-yues/test` - 测试连接
- `GET /api/qianbao-yues/user-wallet` - 获取用户钱包 (需要认证)
- `GET /api/qianbao-yues/token-balances` - 获取代币余额 (需要认证)
- `GET /api/qianbao-yues/token-reward-records` - 获取代币奖励记录 (需要认证)

#### 主要功能:
- 自动创建用户钱包
- 代币余额管理
- 代币奖励记录查询

### 3. 提现模块 (qianbao-tixian)

**路由**: `/api/qianbao-tixians/`

#### 接口列表:
- `GET /api/qianbao-tixians` - 获取提现记录列表
- `GET /api/qianbao-tixians/:id` - 获取指定提现记录
- `POST /api/qianbao-tixians` - 创建提现申请
- `PUT /api/qianbao-tixians/:id` - 更新提现记录
- `DELETE /api/qianbao-tixians/:id` - 删除提现记录

#### 主要功能:
- 提现申请处理
- 区块链交易广播
- 提现状态管理

### 4. AI代币模块 (ai-token)

**路由**: `/api/ai-tokens/`

#### 接口列表:
- `GET /api/ai-tokens` - 获取所有代币
- `GET /api/ai-tokens/active` - 获取活跃代币
- `GET /api/ai-tokens/:id/price` - 获取代币价格
- `GET /api/ai-tokens/prices/batch` - 批量获取代币价格
- `GET /api/ai-tokens/market-data` - 获取市场数据
- `POST /api/ai-tokens/initialize` - 初始化代币数据 (需要管理员权限)

#### 主要功能:
- 代币信息管理
- 价格查询
- 市场数据统计

### 5. 认购计划模块 (dinggou-jihua)

**路由**: `/api/dinggou-jihuas/`

#### 接口列表:
- `GET /api/dinggou-jihuas` - 获取所有计划
- `GET /api/dinggou-jihuas/active` - 获取活跃计划
- `GET /api/dinggou-jihuas/:id` - 获取指定计划
- `POST /api/dinggou-jihuas` - 创建投资计划
- `PUT /api/dinggou-jihuas/:id` - 更新计划
- `DELETE /api/dinggou-jihuas/:id` - 删除计划

#### 主要功能:
- 投资计划管理
- 收益率计算
- 投资周期管理

### 6. 认购订单模块 (dinggou-dingdan)

**路由**: `/api/dinggou-dingdans/`

#### 接口列表:
- `GET /api/dinggou-dingdans` - 获取订单列表
- `GET /api/dinggou-dingdans/:id` - 获取指定订单
- `POST /api/dinggou-dingdans` - 创建投资订单
- `PUT /api/dinggou-dingdans/:id` - 更新订单
- `DELETE /api/dinggou-dingdans/:id` - 删除订单

#### 主要功能:
- 投资订单管理
- 订单状态跟踪
- 收益计算

### 7. 抽奖系统模块

#### 抽奖机会 (choujiang-jihui)
**路由**: `/api/choujiang-jihuis/`

#### 抽奖奖品 (choujiang-jiangpin)
**路由**: `/api/choujiang-jiangpins/`

#### 抽奖记录 (choujiang-ji-lu)
**路由**: `/api/choujiang-ji-lus/`

### 8. 商城系统模块

#### 商品 (shop-product)
**路由**: `/api/shop-products/`

#### 购物车 (shop-cart)
**路由**: `/api/shop-carts/`

#### 订单 (shop-order)
**路由**: `/api/shop-orders/`

### 9. 通知模块 (notice)

**路由**: `/api/notices/`

#### 接口列表:
- `GET /api/notices` - 获取通知列表
- `GET /api/notices/:id` - 获取指定通知
- `POST /api/notices` - 创建通知
- `PUT /api/notices/:id` - 更新通知
- `DELETE /api/notices/:id` - 删除通知

### 10. 健康检查模块 (health)

**路由**: `/api/health/`

#### 接口列表:
- `GET /api/health` - 系统健康检查

## 中间件系统

### 1. 认证中间件 (auth-guard.ts)
- 用户权限验证
- 角色权限检查
- 操作频率限制
- 操作日志记录

### 2. 错误处理中间件 (error-handler.ts)
- 统一错误处理
- 错误日志记录
- 错误响应格式化

### 3. 审计日志中间件 (audit-log.ts)
- 用户操作记录
- 系统事件记录

### 4. 限流中间件 (rate-limit.ts)
- API访问频率限制
- 防止恶意请求

## 队列系统

### 提现队列 (withdraw.ts)
- 提现签名任务
- 交易广播任务
- 交易确认任务
- 队列状态监控

## 定时任务

### 1. 订单检查任务 (check-orders.ts)
- 检查到期订单
- 自动标记可赎回状态
- 执行频率: 每天0点

### 2. 地址轮换任务 (address-rotation.ts)
- 区块链地址管理
- 地址轮换机制

### 3. 提现超时任务 (withdrawal-timeout.ts)
- 处理超时提现
- 自动取消过期提现

## 工具函数

### 1. 数据验证 (validation.ts)
- 用户ID验证
- 金额验证
- 邮箱验证
- 手机号验证
- 邀请码验证

### 2. 错误处理 (errors.ts)
- 自定义错误类型
- 错误分类处理

### 3. 并发控制 (concurrency.ts)
- 并发限制
- 资源管理

### 4. 时区处理 (timezone.ts)
- 时区转换
- 时间格式化

## 服务层

### 1. 通知服务 (notification.ts)
- 邮件通知
- 短信通知
- 站内消息
- 投资相关通知
- 提现相关通知

### 2. 数据完整性服务 (data-integrity.ts)
- 数据一致性检查
- 数据修复

## 数据库配置

### 支持的数据库:
- SQLite (默认)
- MySQL
- PostgreSQL

### 连接配置:
- 连接池管理
- SSL支持
- 超时设置

## 安全特性

1. **认证授权**: JWT token认证
2. **权限控制**: 基于角色的权限管理
3. **输入验证**: 严格的数据验证
4. **限流保护**: API访问频率限制
5. **审计日志**: 完整的操作记录
6. **错误处理**: 统一的错误处理机制

## 部署配置

### 环境变量:
- `HOST`: 服务器地址
- `PORT`: 服务端口
- `DATABASE_CLIENT`: 数据库类型
- `DATABASE_HOST`: 数据库地址
- `DATABASE_NAME`: 数据库名称
- `DATABASE_USERNAME`: 数据库用户名
- `DATABASE_PASSWORD`: 数据库密码

### 启动脚本:
- `npm run dev`: 开发模式
- `npm run build`: 构建项目
- `npm run start`: 生产模式启动

## 总结

这个后端系统是一个功能完整的金融投资平台，包含了用户管理、钱包系统、投资计划、抽奖系统、商城系统等完整的业务模块。系统采用了现代化的技术栈，具有良好的可扩展性和维护性。

主要特点:
1. 模块化设计，代码结构清晰
2. 完善的权限控制系统
3. 队列系统处理异步任务
4. 定时任务自动化管理
5. 完整的错误处理和日志记录
6. 支持多种数据库
7. 丰富的API接口

这个系统可以作为金融投资类应用的后端基础框架，根据具体业务需求进行定制化开发。 