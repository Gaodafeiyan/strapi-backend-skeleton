# 🎰 抽奖系统文档

## 系统概述

抽奖系统是一个**免费赠送**的功能，用户在认购订单赎回时会自动获得抽奖机会。系统支持多种奖品类型，包括USDT、AI代币和实物奖品。

## 数据模型

### 1. 抽奖机会 (choujiang-jihui)
- **用途**: 管理用户的抽奖机会
- **字段**:
  - `yonghu`: 用户关系
  - `dingdan`: 关联订单
  - `zongCiShu`: 总抽奖次数
  - `yiYongCiShu`: 已用抽奖次数
  - `shengYuCiShu`: 剩余抽奖次数
  - `zhuangtai`: 状态 (active/used/expired)
  - `daoQiShiJian`: 到期时间
  - `chuangJianShiJian`: 创建时间

### 2. 抽奖奖品 (choujiang-jiangpin)
- **用途**: 管理抽奖奖品
- **字段**:
  - `jiangpinMing`: 奖品名称
  - `jiangpinMiaoShu`: 奖品描述
  - `jiangpinTuPian`: 奖品图片
  - `jiangpinLeiXing`: 奖品类型 (USDT/AI_TOKEN/WU_PIN)
  - `jiangpinJiaZhi`: 奖品价值
  - `zhongJiangGaiLv`: 中奖概率 (0-100)
  - `kuCunShuLiang`: 库存数量
  - `yiFaChuShuLiang`: 已发出数量
  - `paiXuShunXu`: 排序顺序
  - `kaiQi`: 是否开启
  - `teBieJiangPin`: 是否特别奖品

### 3. 抽奖记录 (choujiang-jiLu)
- **用途**: 记录用户抽奖历史
- **字段**:
  - `yonghu`: 用户关系
  - `jiangpin`: 奖品关系
  - `choujiangJihui`: 抽奖机会关系
  - `dingdan`: 订单关系
  - `chouJiangShiJian`: 抽奖时间
  - `jiangPinMing`: 奖品名称
  - `jiangPinJiaZhi`: 奖品价值
  - `jiangPinLeiXing`: 奖品类型
  - `zhuangtai`: 状态 (zhongJiang/weiLingQu/yiLingQu/yiGuoQi)
  - `lingQuShiJian`: 领取时间
  - `beiZhu`: 备注信息

## API接口

### 1. 执行抽奖
```http
POST /api/choujiang/perform
Authorization: Bearer <token>
Content-Type: application/json

{
  "jihuiId": 1
}
```

### 2. 获取用户抽奖机会
```http
GET /api/choujiang/jihui
Authorization: Bearer <token>
```

### 3. 检查用户抽奖机会
```http
GET /api/choujiang/check-jihui
Authorization: Bearer <token>
```

### 4. 获取用户抽奖记录
```http
GET /api/choujiang/records?limit=20&offset=0
Authorization: Bearer <token>
```

### 5. 领取实物奖品
```http
POST /api/choujiang/claim-prize
Authorization: Bearer <token>
Content-Type: application/json

{
  "recordId": 1
}
```

### 6. 获取抽奖奖品列表（公开）
```http
GET /api/choujiang/prizes
```

## 业务流程

### 1. 抽奖机会创建
- 用户在订单赎回时自动获得抽奖机会
- 抽奖次数由投资计划的 `choujiangCi` 字段决定
- 抽奖机会有效期为30天

### 2. 抽奖执行
1. 验证抽奖机会是否有效
2. 获取可用奖品列表
3. 根据概率算法选择奖品
4. 更新奖品库存
5. 创建抽奖记录
6. 自动发放USDT/AI代币奖品

### 3. 奖品发放
- **USDT/AI代币**: 自动发放到用户钱包
- **实物奖品**: 需要用户手动领取

## 概率算法

系统使用累积概率算法：
1. 计算所有奖品的累积概率
2. 生成0-100的随机数
3. 根据随机数落在的概率区间选择奖品
4. 如果没有中奖，返回概率最高的奖品

## 测试脚本

### 基础测试
```bash
chmod +x test-choujiang-system.sh
./test-choujiang-system.sh
```

### 完整流程测试
```bash
chmod +x test-complete-choujiang-flow.sh
./test-complete-choujiang-flow.sh
```

## 管理后台配置

### 1. 创建奖品
在Strapi管理后台的"抽奖奖品"模块中：
1. 添加奖品名称和描述
2. 设置奖品类型和价值
3. 配置中奖概率（总和不超过100%）
4. 设置库存数量
5. 上传奖品图片

### 2. 配置投资计划
在"认购计划"模块中：
1. 设置 `choujiangCi` 字段（赠送的抽奖次数）
2. 保存计划配置

## 注意事项

1. **免费功能**: 抽奖完全免费，不需要用户支付任何费用
2. **自动发放**: USDT和AI代币奖品会自动发放到用户钱包
3. **库存管理**: 系统会自动管理奖品库存，防止超发
4. **概率控制**: 管理员可以在后台调整奖品概率
5. **记录追踪**: 所有抽奖记录都会保存，便于审计

## 前端集成建议

1. **转盘UI**: 实现旋转转盘效果
2. **奖品展示**: 显示可用奖品列表
3. **机会显示**: 显示用户剩余抽奖次数
4. **记录页面**: 展示用户抽奖历史
5. **中奖弹窗**: 显示中奖结果和奖品信息 