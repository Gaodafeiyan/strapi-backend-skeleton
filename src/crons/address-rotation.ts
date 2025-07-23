export default ({ strapi }) => ({
  // 每小时检查一次地址轮换
  '0 * * * *': async () => {
    try {
      console.log('🔄 开始执行地址轮换检查...');
      
      // 获取钱包地址服务
      const walletAddressService = strapi.service('api::wallet-address.wallet-address');
      
      // 执行地址轮换
      await walletAddressService.rotateAddresses();
      
      // 检查是否需要生成新地址
      await checkAndGenerateNewAddresses(strapi);
      
      console.log('✅ 地址轮换检查完成');
    } catch (error) {
      console.error('❌ 地址轮换失败:', error);
    }
  },

  // 每天凌晨2点执行深度清理
  '0 2 * * *': async () => {
    try {
      console.log('🧹 开始执行地址深度清理...');
      
      await performDeepAddressCleanup(strapi);
      
      console.log('✅ 地址深度清理完成');
    } catch (error) {
      console.error('❌ 地址深度清理失败:', error);
    }
  }
});

// 检查并生成新地址
async function checkAndGenerateNewAddresses(strapi) {
  try {
    const walletAddressService = strapi.service('api::wallet-address.wallet-address');
    
    // 检查各链各资产的地址数量
    const chains = ['BSC', 'ETH', 'TRON'];
    const assets = ['USDT', 'AI_TOKEN'];
    
    for (const chain of chains) {
      for (const asset of assets) {
        const activeAddresses = await strapi.entityService.findMany('api::wallet-address.wallet-address', {
          filters: {
            chain,
            asset,
            status: 'active'
          }
        });
        
        // 如果活跃地址少于5个，生成新地址
        if (activeAddresses.length < 5) {
          const needCount = 10 - activeAddresses.length;
          console.log(`生成 ${needCount} 个新的 ${chain} 链 ${asset} 地址`);
          
          await walletAddressService.generateNewAddresses(needCount, chain, asset);
        }
      }
    }
  } catch (error) {
    console.error('检查并生成新地址失败:', error);
  }
}

// 深度清理地址
async function performDeepAddressCleanup(strapi) {
  try {
    // 1. 清理长期未使用的地址
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveAddresses = await strapi.entityService.findMany('api::wallet-address.wallet-address', {
      filters: {
        status: 'inactive',
        last_used_at: {
          $lt: thirtyDaysAgo
        }
      }
    });
    
    for (const address of inactiveAddresses) {
      await strapi.entityService.delete('api::wallet-address.wallet-address', address.id);
      console.log(`删除长期未使用的地址: ${address.address}`);
    }
    
    // 2. 重置使用统计
    const highUsageAddresses = await strapi.entityService.findMany('api::wallet-address.wallet-address', {
      filters: {
        usage_count: {
          $gt: 1000
        }
      }
    });
    
    for (const address of highUsageAddresses) {
      await strapi.entityService.update('api::wallet-address.wallet-address', address.id, {
        data: {
          usage_count: 0,
          priority: Math.max(20, address.priority - 20)
        }
      });
      console.log(`重置地址使用统计: ${address.address}`);
    }
    
    // 3. 重新激活维护中的地址
    const maintenanceAddresses = await strapi.entityService.findMany('api::wallet-address.wallet-address', {
      filters: {
        status: 'maintenance',
        balance: {
          $lt: 100 // 余额小于100的可以重新激活
        }
      }
    });
    
    for (const address of maintenanceAddresses) {
      await strapi.entityService.update('api::wallet-address.wallet-address', address.id, {
        data: {
          status: 'active',
          priority: 50
        }
      });
      console.log(`重新激活地址: ${address.address}`);
    }
    
  } catch (error) {
    console.error('深度清理地址失败:', error);
  }
} 