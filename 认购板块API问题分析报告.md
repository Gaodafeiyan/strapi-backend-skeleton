# 认购板块API问题分析报告

## 🔍 问题概述

前端认购板块出现404错误，主要问题集中在用户钱包相关的API接口上。

## 📊 测试结果分析

### ✅ 正常工作的API：
- `/api/dinggou-jihuas/active` - 获取活跃认购计划 ✅ 200
- `/api/dinggou-jihuas` - 获取所有认购计划 ✅ 200  
- `/api/dinggou-dingdans` - 获取认购订单 ✅ 200
- `/api/notices/active` - 获取活跃通知 ✅ 200
- `/api/health` - 健康检查 ✅ 200
- `/api/ai-tokens` - AI代币列表 ✅ 200
- `/api/ai-tokens/active` - 活跃AI代币 ✅ 200

### ❌ 有问题的API：
- `/api/qianbao-yues/user-wallet` - 获取用户钱包 ❌ 404
- `/api/qianbao-yues/token-balances` - 获取代币余额 ❌ 404

## 🔧 问题根源

### 1. 路由注册问题
钱包相关的自定义路由没有正确注册到Strapi中，导致404错误。

### 2. 认证问题
部分API需要认证，但前端可能没有正确处理认证状态。

### 3. 路由配置问题
自定义路由的配置可能存在问题，导致Strapi无法正确识别。

## 🛠️ 解决方案

### 方案1：重启Strapi服务器
```bash
# 在服务器上执行
cd strapi-backend-skeleton
npm run develop
```

### 方案2：修复前端认证逻辑
在前端的`subscription_service.dart`中添加认证检查：

```dart
class SubscriptionService {
  final HttpClient _httpClient = HttpClient();

  // 确保认证token正确设置
  Future<void> _ensureAuth() async {
    final token = await _httpClient.getToken();
    if (token == null) {
      throw Exception('用户未登录，请先登录');
    }
  }

  // 获取用户钱包（需要认证）
  Future<Map<String, dynamic>> getUserWallet() async {
    try {
      await _ensureAuth(); // 确保用户已登录
      _httpClient.init();
      final response = await _httpClient.dio.get('/api/qianbao-yues/user-wallet');
      
      if (response.statusCode == 200) {
        return {'success': true, 'data': response.data['data']};
      }
      return {'success': false, 'message': '获取钱包失败'};
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        return {'success': false, 'message': '用户未登录，请先登录'};
      }
      return {'success': false, 'message': e.response?.data?['error']?['message'] ?? '网络错误'};
    } catch (e) {
      return {'success': false, 'message': '获取钱包失败: $e'};
    }
  }
}
```

### 方案3：检查后端路由配置
确保钱包路由配置正确：

```typescript
// src/api/qianbao-yue/routes/qianbao-yue.ts
export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.find',
    },
    // 自定义路由
    {
      method: 'GET',
      path: '/qianbao-yues/user-wallet',
      handler: 'qianbao-yue.getUserWallet',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/qianbao-yues/token-balances',
      handler: 'qianbao-yue.getTokenBalances',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

## 📋 修复步骤

### 1. 立即修复（临时方案）
- 重启Strapi服务器
- 检查服务器日志中的路由注册信息

### 2. 前端修复
- 在认购服务中添加认证检查
- 处理401错误时重新登录
- 确保token正确保存和发送

### 3. 后端修复
- 检查路由配置是否正确
- 确保控制器方法存在
- 验证认证中间件配置

## 🎯 预期结果

修复后，以下API应该正常工作：
- ✅ `/api/qianbao-yues/user-wallet` - 获取用户钱包
- ✅ `/api/qianbao-yues/token-balances` - 获取代币余额
- ✅ `/api/dinggou-dingdans` - 获取认购订单（需要认证）

## 📞 后续建议

1. **监控API状态**：定期检查API接口状态
2. **日志分析**：查看Strapi服务器日志中的错误信息
3. **用户反馈**：收集用户使用过程中的问题反馈
4. **性能优化**：优化API响应时间和错误处理

---

**报告生成时间**: 2025-07-26  
**问题状态**: 已识别，需要修复  
**优先级**: 高 