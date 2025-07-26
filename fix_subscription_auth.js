const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 修复认购板块认证问题
async function fixSubscriptionAuth() {
  console.log('🔧 开始修复认购板块认证问题...\n');

  try {
    // 1. 检查后端API路由配置
    console.log('1. 检查后端API路由配置...');
    
    const routesToCheck = [
      { path: '/api/dinggou-jihuas/active', method: 'GET', auth: false },
      { path: '/api/dinggou-jihuas', method: 'GET', auth: true },
      { path: '/api/dinggou-dingdans', method: 'GET', auth: true },
      { path: '/api/qianbao-yues/user-wallet', method: 'GET', auth: true },
      { path: '/api/qianbao-yues/token-balances', method: 'GET', auth: true },
      { path: '/api/notices/active', method: 'GET', auth: false },
    ];

    for (const route of routesToCheck) {
      try {
        const response = await axios.get(`${BASE_URL}${route.path}`);
        console.log(`✅ ${route.path}: ${response.status} (需要认证: ${route.auth})`);
      } catch (error) {
        if (error.response?.status === 401 && route.auth) {
          console.log(`✅ ${route.path}: 401 (正确 - 需要认证)`);
        } else if (error.response?.status === 404) {
          console.log(`❌ ${route.path}: 404 (路由不存在)`);
        } else {
          console.log(`❌ ${route.path}: ${error.response?.status} (${error.response?.data?.error?.message || 'Unknown error'})`);
        }
      }
    }

    // 2. 检查认证中间件配置
    console.log('\n2. 检查认证中间件配置...');
    
    // 检查是否需要修改路由配置
    const routesNeedingFix = [
      '/api/dinggou-jihuas',
      '/api/dinggou-dingdans', 
      '/api/qianbao-yues/user-wallet',
      '/api/qianbao-yues/token-balances'
    ];

    console.log('需要认证的API路由:');
    routesNeedingFix.forEach(route => {
      console.log(`  - ${route} (需要有效token)`);
    });

    // 3. 提供修复建议
    console.log('\n3. 修复建议:');
    console.log('前端需要确保:');
    console.log('  ✅ 用户登录后正确保存JWT token');
    console.log('  ✅ 每次API请求都携带Authorization header');
    console.log('  ✅ 处理401错误时重新登录');
    console.log('  ✅ 处理token过期时清除本地存储');
    
    console.log('\n后端需要确保:');
    console.log('  ✅ 认证中间件正确配置');
    console.log('  ✅ 路由权限设置正确');
    console.log('  ✅ 用户认证状态正确验证');

    // 4. 测试认证流程
    console.log('\n4. 测试认证流程...');
    
    // 模拟登录获取token
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: 'admin@example.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.jwt) {
        const token = loginResponse.data.jwt;
        console.log('✅ 登录成功，获取到token');
        
        // 测试带认证的API
        const authHeaders = { 'Authorization': `Bearer ${token}` };
        
        try {
          const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, { headers: authHeaders });
          console.log('✅ 带认证的钱包API测试成功:', walletResponse.status);
        } catch (error) {
          console.log('❌ 带认证的钱包API测试失败:', error.response?.status, error.response?.data);
        }
        
        try {
          const ordersResponse = await axios.get(`${BASE_URL}/api/dinggou-dingdans`, { headers: authHeaders });
          console.log('✅ 带认证的订单API测试成功:', ordersResponse.status);
        } catch (error) {
          console.log('❌ 带认证的订单API测试失败:', error.response?.status, error.response?.data);
        }
      }
    } catch (error) {
      console.log('❌ 登录测试失败:', error.response?.status, error.response?.data);
    }

    // 5. 生成修复代码
    console.log('\n5. 生成修复代码...');
    
    const fixCode = `
// 前端修复代码 - 在subscription_service.dart中添加

class SubscriptionService {
  final HttpClient _httpClient = HttpClient();

  // 确保认证token正确设置
  Future<void> _ensureAuth() async {
    final token = await _httpClient.getToken();
    if (token == null) {
      throw Exception('用户未登录，请先登录');
    }
  }

  // 获取活跃认购计划（不需要认证）
  Future<Map<String, dynamic>> getActivePlans() async {
    try {
      _httpClient.init();
      final response = await _httpClient.dio.get('/api/dinggou-jihuas/active');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final plans = data.map((json) => DinggouJihua.fromJson(json)).toList();
        return {'success': true, 'data': plans};
      }
      return {'success': false, 'message': '获取活跃计划失败'};
    } on DioException catch (e) {
      return {'success': false, 'message': e.response?.data?['error']?['message'] ?? '网络错误'};
    } catch (e) {
      return {'success': false, 'message': '未知错误: $e'};
    }
  }

  // 获取认购订单（需要认证）
  Future<Map<String, dynamic>> getSubscriptionOrders({
    String? orderState,
    int page = 1,
    int pageSize = 25,
  }) async {
    try {
      await _ensureAuth(); // 确保用户已登录
      _httpClient.init();
      
      final queryParams = <String, dynamic>{
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'sort': 'createdAt:desc',
      };
      
      if (orderState != null) {
        queryParams['filters[status]'] = orderState;
      }
      
      final response = await _httpClient.dio.get('/api/dinggou-dingdans', queryParameters: queryParams);
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final orders = data.map((json) => DinggouDingdan.fromJson(json)).toList();
        return {'success': true, 'data': orders, 'meta': response.data['meta']};
      }
      return {'success': false, 'message': '获取订单失败'};
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        return {'success': false, 'message': '用户未登录，请先登录'};
      }
      return {'success': false, 'message': e.response?.data?['error']?['message'] ?? '网络错误'};
    } catch (e) {
      return {'success': false, 'message': '未知错误: $e'};
    }
  }
}
`;

    console.log('修复代码已生成，请在前端项目中应用');

  } catch (error) {
    console.error('修复过程中发生错误:', error.message);
  }
}

// 运行修复
fixSubscriptionAuth(); 