import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::wallet-address.wallet-address',
  ({ strapi }) => ({
    // 继承默认的CRUD操作
    
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        
        if (!data) {
          return ctx.badRequest('缺少data字段');
        }
        
        const { address, chain, asset, description } = data;
        
        if (!address) {
          return ctx.badRequest('钱包地址不能为空');
        }
        
        if (!chain) {
          return ctx.badRequest('链类型不能为空');
        }
        
        if (!asset) {
          return ctx.badRequest('资产类型不能为空');
        }
        
        // 创建钱包地址
        const walletAddress = await strapi.entityService.create('api::wallet-address.wallet-address', {
          data: {
            address,
            chain,
            asset,
            description: description || '',
            wallet_status: 'active',
            priority: 50,
            usage_count: 0,
            balance: '0',
            max_balance: '10000'
          }
        });
        
        ctx.body = { data: walletAddress };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 获取最佳钱包地址
    async getBestAddress(ctx) {
      try {
        const { chain, asset } = ctx.params;
        
        // 查找符合条件的活跃钱包地址，按优先级和使用次数排序
        const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address', {
          filters: {
            chain,
            asset,
            wallet_status: 'active'
          },
          sort: { priority: 'desc', usage_count: 'asc' },
          limit: 1
        });
        
        if (addresses.length === 0) {
          return ctx.notFound('没有可用的钱包地址');
        }
        
        const bestAddress = addresses[0];
        
        // 更新使用次数
        await strapi.entityService.update('api::wallet-address.wallet-address', bestAddress.id, {
          data: {
            usage_count: bestAddress.usage_count + 1,
            last_used_at: new Date()
          }
        });
        
        ctx.body = { data: bestAddress };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 轮换钱包地址
    async rotateAddresses(ctx) {
      try {
        const { chain, asset } = ctx.request.body;
        
        if (!chain || !asset) {
          return ctx.badRequest('缺少chain或asset参数');
        }
        
        // 重置所有指定链和资产的钱包地址使用次数
        const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address', {
          filters: {
            chain,
            asset,
            wallet_status: 'active'
          }
        });
        
        for (const address of addresses) {
          await strapi.entityService.update('api::wallet-address.wallet-address', address.id, {
            data: {
              usage_count: 0,
              last_used_at: null
            }
          });
        }
        
        ctx.body = { 
          data: { 
            message: '钱包地址轮换成功',
            rotatedCount: addresses.length 
          } 
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 生成新钱包地址
    async generateAddresses(ctx) {
      try {
        const { chain, asset, count = 1 } = ctx.request.body;
        
        if (!chain || !asset) {
          return ctx.badRequest('缺少chain或asset参数');
        }
        
        const generatedAddresses = [];
        
        for (let i = 0; i < count; i++) {
          // 生成模拟地址（实际项目中应该调用相应的区块链API）
          const mockAddress = generateMockAddress(chain);
          
          const newAddress = await strapi.entityService.create('api::wallet-address.wallet-address', {
            data: {
              address: mockAddress,
              chain,
              asset,
              description: `自动生成的${chain}地址`,
              wallet_status: 'active',
              priority: 50,
              usage_count: 0,
              balance: '0',
              max_balance: '10000'
            }
          });
          
          generatedAddresses.push(newAddress);
        }
        
        ctx.body = { 
          data: { 
            message: '钱包地址生成成功',
            addresses: generatedAddresses 
          } 
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    }
  })
);

// 生成模拟地址的辅助函数
function generateMockAddress(chain) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  switch (chain) {
    case 'ETH':
      return `0x${timestamp.toString(16)}${random}${Math.random().toString(16).substring(2, 10)}`;
    case 'BSC':
      return `0x${timestamp.toString(16)}${random}${Math.random().toString(16).substring(2, 10)}`;
    case 'TRON':
      return `T${timestamp.toString(16)}${random}${Math.random().toString(16).substring(2, 10)}`;
    default:
      return `0x${timestamp.toString(16)}${random}${Math.random().toString(16).substring(2, 10)}`;
  }
} 