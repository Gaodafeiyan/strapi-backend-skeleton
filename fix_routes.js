const fs = require('fs');
const path = require('path');

// 修复钱包路由配置
function fixWalletRoutes() {
  const walletRoutesPath = path.join(__dirname, 'src/api/qianbao-yue/routes/qianbao-yue.ts');
  
  const walletRoutesContent = `export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.find',
    },
    {
      method: 'GET',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.findOne',
    },
    {
      method: 'POST',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.create',
    },
    {
      method: 'PUT',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.update',
    },
    {
      method: 'DELETE',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.delete',
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
    {
      method: 'GET',
      path: '/qianbao-yues/token-reward-records',
      handler: 'qianbao-yue.getTokenRewardRecords',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};`;

  fs.writeFileSync(walletRoutesPath, walletRoutesContent);
  console.log('✅ 钱包路由配置已修复');
}

// 修复AI代币路由配置
function fixAITokenRoutes() {
  const aiTokenRoutesPath = path.join(__dirname, 'src/api/ai-token/routes/ai-token.ts');
  
  const aiTokenRoutesContent = `export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/ai-tokens',
      handler: 'ai-token.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/active',
      handler: 'ai-token.getActiveTokens',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/:id/price',
      handler: 'ai-token.getTokenPrice',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/prices/batch',
      handler: 'ai-token.getBatchPrices',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/market-data',
      handler: 'ai-token.getMarketData',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/ai-tokens/initialize',
      handler: 'ai-token.initializeTokens',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};`;

  fs.writeFileSync(aiTokenRoutesPath, aiTokenRoutesContent);
  console.log('✅ AI代币路由配置已修复');
}

// 创建路由索引文件
function createRoutesIndex() {
  const routesIndexPath = path.join(__dirname, 'src/api/routes.ts');
  
  const routesIndexContent = `// 自动生成的路由索引文件
export default {
  // 钱包路由
  'qianbao-yue': () => import('./qianbao-yue/routes/qianbao-yue'),
  // AI代币路由
  'ai-token': () => import('./ai-token/routes/ai-token'),
};`;

  fs.writeFileSync(routesIndexPath, routesIndexContent);
  console.log('✅ 路由索引文件已创建');
}

// 主函数
function main() {
  try {
    console.log('🔧 开始修复路由配置...');
    
    // 修复钱包路由
    fixWalletRoutes();
    
    // 修复AI代币路由
    fixAITokenRoutes();
    
    // 创建路由索引
    createRoutesIndex();
    
    console.log('🎉 路由配置修复完成！');
    console.log('💡 请重启Strapi服务器以使更改生效');
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

main(); 