# 🎰 抽奖系统设计（修正版）

## 📋 系统概述

抽奖系统是一个独立的模块，与商城板块集成。用户通过投资订单赎回获得免费抽奖机会，抽奖获得的奖品（商品、金币、优惠券）将在商城板块中使用。

## 🏗️ 数据模型

### 1. 抽奖机会 (choujiang-jihui)
```typescript
{
  yonghu: User,           // 用户
  dingdan: DinggouDingdan, // 关联订单
  zongCiShu: number,      // 总次数
  shengYuCiShu: number,   // 剩余次数
  zhuangtai: string,      // 状态：active/used/expired
  chuangJianShiJian: Date // 创建时间
}
```

### 2. 抽奖奖品 (choujiang-jiangpin)
```typescript
{
  jiangpinMing: string,     // 奖品名称
  jiangpinMiaoShu: string,  // 奖品描述
  jiangpinTuPian: string,   // 奖品图片
  jiangpinLeiXing: enum,    // 奖品类型：SHANG_PIN/JIN_BI/YOU_HUI_QUAN
  jiangpinJiaZhi: string,   // 奖品价值
  zhongJiangGaiLv: number,  // 中奖概率
  kuCunShuLiang: number,    // 库存数量
  yiFaChuShuLiang: number,  // 已发出数量
  paiXuShunXu: number,      // 排序顺序
  kaiQi: boolean,           // 是否开启
  teBieJiangPin: boolean    // 是否特别奖品
}
```

### 3. 抽奖记录 (choujiang-ji-lu)
```typescript
{
  yonghu: User,           // 用户
  jiangpin: ChoujiangJiangpin, // 奖品
  choujiangJihui: ChoujiangJihui, // 抽奖机会
  dingdan: DinggouDingdan, // 关联订单
  chouJiangShiJian: Date,  // 抽奖时间
  jiangPinMing: string,    // 奖品名称
  jiangPinJiaZhi: string,  // 奖品价值
  jiangPinLeiXing: string, // 奖品类型
  zhuangtai: string,       // 状态：zhongJiang/yiLingQu
  lingQuShiJian: Date,     // 领取时间
  beiZhu: string           // 备注
}
```

## 🔄 业务流程

### 1. 抽奖机会创建
- 用户赎回投资订单时自动创建
- 抽奖次数根据投资计划配置
- 状态为 `active`

### 2. 抽奖执行
- 用户使用抽奖机会
- 根据概率算法选择奖品
- 更新奖品库存
- 创建抽奖记录

### 3. 奖品管理
- 奖品不直接发放到钱包
- 通过抽奖记录管理
- 用户可在商城板块使用奖品

## 🎯 奖品类型

### SHANG_PIN (商品)
- 商城中的实体商品
- 用户中奖后获得商品券
- 可在商城兑换对应商品

### JIN_BI (金币)
- 平台内部金币
- 可在商城中使用
- 用于购买商品或服务

### YOU_HUI_QUAN (优惠券)
- 商城优惠券
- 提供折扣或减免
- 在购物时使用

## 🔌 API接口

### 抽奖相关
- `POST /api/choujiang/perform` - 执行抽奖
- `GET /api/choujiang/jihui` - 获取抽奖机会
- `GET /api/choujiang/check-jihui` - 检查抽奖机会
- `GET /api/choujiang/records` - 获取抽奖记录
- `POST /api/choujiang/claim-prize` - 领取奖品
- `GET /api/choujiang/prizes` - 获取奖品列表

## 🔗 与商城板块集成

### 数据关联
- 抽奖记录中的奖品ID关联商城商品
- 奖品类型决定在商城中的使用方式
- 奖品状态影响商城中的可用性

### 业务集成点
1. **商品展示**: 商城显示用户获得的奖品
2. **奖品兑换**: 用户使用奖品兑换商品
3. **库存同步**: 奖品库存与商品库存联动
4. **状态更新**: 奖品使用后更新抽奖记录状态

## 🎲 概率算法

```typescript
calculatePrize(prizes: Prize[]): Prize {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const prize of prizes) {
    cumulative += prize.zhongJiangGaiLv;
    if (random <= cumulative) {
      return prize;
    }
  }
  
  // 保底机制：返回概率最高的奖品
  return prizes.sort((a, b) => b.zhongJiangGaiLv - a.zhongJiangGaiLv)[0];
}
```

## 🔒 安全机制

### 数据验证
- 抽奖机会有效性检查
- 奖品库存验证
- 用户权限验证

### 防刷机制
- 抽奖机会一次性使用
- 奖品库存实时更新
- 操作日志记录

## 📊 监控指标

### 业务指标
- 抽奖参与率
- 中奖率统计
- 奖品发放量
- 用户活跃度

### 技术指标
- API响应时间
- 错误率统计
- 系统负载
- 数据库性能

## 🚀 部署说明

### 环境要求
- Node.js 18+
- Strapi 4.x
- PostgreSQL/MySQL
- Redis (可选，用于缓存)

### 配置项
- 奖品概率配置
- 库存管理策略
- 抽奖次数限制
- 奖品有效期设置

## 🎉 总结

修正后的抽奖系统：
- ✅ 奖品类型改为商城相关（商品/金币/优惠券）
- ✅ 移除直接发放USDT/AI代币的逻辑
- ✅ 通过抽奖记录管理奖品
- ✅ 与商城板块集成
- ✅ 保持核心抽奖功能完整

系统现在更加合理，奖品将在商城板块中发挥作用，为用户提供更好的购物体验。 