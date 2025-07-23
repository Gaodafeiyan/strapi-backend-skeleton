# 🎰 抽奖功能测试指南

## 功能状态确认

### ✅ 已完成的抽奖功能

1. **数据模型** ✅
   - `choujiang-jihui` - 抽奖机会管理
   - `choujiang-jiangpin` - 抽奖奖品管理
   - `choujiang-ji-lu` - 抽奖记录管理

2. **核心服务** ✅
   - 抽奖机会创建和管理
   - 抽奖执行和概率计算
   - 奖品自动发放
   - 抽奖记录追踪

3. **API接口** ✅
   - 执行抽奖: `POST /api/choujiang/perform`
   - 获取抽奖机会: `GET /api/choujiang/jihui`
   - 检查抽奖机会: `GET /api/choujiang/check-jihui`
   - 获取抽奖记录: `GET /api/choujiang/records`
   - 领取实物奖品: `POST /api/choujiang/claim-prize`
   - 获取奖品列表: `GET /api/choujiang/prizes`

4. **业务集成** ✅
   - 订单赎回时自动创建抽奖机会
   - 与钱包系统集成（自动发放USDT/AI代币）
   - 与投资计划集成（配置抽奖次数）

## 🧪 测试步骤

### 第一步：准备测试环境

1. **启动Strapi服务**
   ```bash
   cd strapi-backend-skeleton
   npm run develop
   ```

2. **确认服务正常运行**
   - 访问: http://localhost:1337/admin
   - 确认抽奖相关内容类型已显示

### 第二步：配置测试数据

#### 2.1 创建测试用户
```bash
# 注册测试用户
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

#### 2.2 配置投资计划
在Strapi管理后台：
1. 进入"认购计划"
2. 编辑现有计划或创建新计划
3. 设置 `choujiangCi` 字段为 3（或其他数字）

#### 2.3 配置抽奖奖品
在Strapi管理后台：
1. 进入"抽奖奖品"
2. 创建测试奖品：
   - 奖品名称: "测试商品"
   - 奖品类型: SHANG_PIN (商品)
   - 奖品价值: "100"
   - 中奖概率: 30
   - 库存数量: 100
   - 开启: 是

### 第三步：执行测试流程

#### 3.1 用户登录
```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser@example.com",
    "password": "password123"
  }'
```

#### 3.2 充值钱包（如果需要）
```bash
# 获取充值地址
curl -X GET "http://localhost:1337/api/qianbao-chongzhi/deposit-address?chain=BSC&asset=USDT" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建充值记录（模拟）
curl -X POST http://localhost:1337/api/qianbao-chongzhi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "usdtJine": "1000",
      "chongzhiAddress": "0x1234567890abcdef",
      "chain": "BSC"
    }
  }'
```

#### 3.3 创建投资订单
```bash
# 获取投资计划
curl -X GET http://localhost:1337/api/dinggou-jihuas \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建投资订单
curl -X POST http://localhost:1337/api/dinggou-dingdans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "jihuaId": 1
    }
  }'
```

#### 3.4 赎回订单（创建抽奖机会）
```bash
# 强制赎回订单（测试模式）
curl -X POST http://localhost:1337/api/dinggou-dingdans/1/redeem \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "force": true,
    "testMode": true
  }'
```

#### 3.5 检查抽奖机会
```bash
# 检查用户抽奖机会
curl -X GET http://localhost:1337/api/choujiang/check-jihui \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取抽奖机会详情
curl -X GET http://localhost:1337/api/choujiang/jihui \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3.6 执行抽奖
```bash
# 执行抽奖
curl -X POST http://localhost:1337/api/choujiang/perform \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jihuiId": 1
  }'
```

#### 3.7 查看抽奖记录
```bash
# 获取用户抽奖记录
curl -X GET http://localhost:1337/api/choujiang/records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3.8 查看奖品列表
```bash
# 获取抽奖奖品列表
curl -X GET http://localhost:1337/api/choujiang/prizes
```

### 第四步：验证结果

#### 4.1 检查钱包余额变化
```bash
# 获取钱包余额
curl -X GET http://localhost:1337/api/qianbao-yue/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.2 检查管理后台数据
1. 进入Strapi管理后台
2. 检查"抽奖机会" - 确认机会已创建
3. 检查"抽奖记录" - 确认抽奖记录已生成
4. 检查"抽奖奖品" - 确认库存已更新

## 🎯 测试要点

### 功能验证
- ✅ 订单赎回时自动创建抽奖机会
- ✅ 抽奖机会数量正确
- ✅ 抽奖执行成功
- ✅ 奖品记录完整保存
- ✅ 奖品库存正确更新
- ✅ 奖品领取功能正常

### 错误处理
- ✅ 无抽奖机会时的错误提示
- ✅ 奖品库存不足时的处理
- ✅ 无效抽奖机会的错误处理

### 数据一致性
- ✅ 抽奖机会使用后数量减少
- ✅ 奖品发放后库存减少
- ✅ 抽奖记录完整保存
- ✅ 奖品状态正确更新

## 🚀 自动化测试

运行完整测试脚本：
```bash
chmod +x test-complete-choujiang-flow.sh
./test-complete-choujiang-flow.sh
```

## 📊 预期结果

成功测试后应该看到：
1. 投资订单创建成功
2. 订单赎回成功，获得收益
3. 抽奖机会自动创建
4. 抽奖执行成功，获得奖品
5. 抽奖记录完整保存
6. 奖品可在商城板块使用

## 🎉 测试完成

抽奖功能已完全开发完成并通过测试！用户可以享受免费的抽奖体验。🎰 