import { factories } from '@strapi/strapi';

// 定义类型
type ChainType = 'BSC' | 'ETH' | 'TRON';
type AssetType = 'USDT' | 'AI_TOKEN' | 'ETH' | 'BNB';

export default factories.createCoreService('api::wallet-address.wallet-address' as any, ({ strapi }) => ({
  // 获取最佳充值地址
  async getBestDepositAddress(chain: ChainType, asset: AssetType, userId?: number) {
    try {
      // 1. 查找符合条件的地址
      const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address' as any, {
        filters: {
          chain,
          asset,
          status: 'active',
          balance: {
            $lt: '10000' // 余额小于10000的地址，改为string类型
          }
        },
        sort: [
          { priority: 'desc' }, // 优先级高的优先
          { usage_count: 'asc' }, // 使用次数少的优先
          { last_used_at: 'asc' } // 最后使用时间早的优先
        ],
        limit: 10
      });

      if (addresses.length === 0) {
        throw new Error(`没有可用的${chain}链${asset}充值地址`);
      }

      // 2. 选择最佳地址（第一个）
      const bestAddress = addresses[0];

      // 3. 更新使用统计
      await strapi.entityService.update('api::wallet-address.wallet-address' as any, bestAddress.id, {
        data: {
          usage_count: (bestAddress as any).usage_count + 1,
          last_used_at: new Date()
        }
      });

      // 4. 记录分配日志（暂时注释，因为address-allocation-log可能不存在）
      // await strapi.service('api::address-allocation-log.address-allocation-log').create({
      //   data: {
      //     wallet_address: bestAddress.id,
      //     user_id: userId,
      //     chain,
      //     asset,
      //     allocation_type: 'deposit',
      //     timestamp: new Date()
      //   }
      // });

      return {
        address: (bestAddress as any).address,
        chain: (bestAddress as any).chain,
        asset: (bestAddress as any).asset,
        description: (bestAddress as any).description
      };
    } catch (error) {
      console.error('获取充值地址失败:', error);
      throw error;
    }
  },

  // 获取提现地址（余额充足的）
  async getWithdrawalAddress(chain: ChainType, asset: AssetType, amount: string) {
    try {
      const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address' as any, {
        filters: {
          chain,
          asset,
          status: 'active',
          balance: {
            $gte: amount // 余额足够，amount已经是string类型
          }
        },
        sort: [
          { balance: 'desc' }, // 余额多的优先
          { priority: 'desc' }
        ],
        limit: 5
      });

      if (addresses.length === 0) {
        throw new Error(`没有余额足够的${chain}链${asset}提现地址`);
      }

      return addresses[0];
    } catch (error) {
      console.error('获取提现地址失败:', error);
      throw error;
    }
  },

  // 更新地址余额
  async updateAddressBalance(addressId: number, newBalance: string) {
    try {
      await strapi.entityService.update('api::wallet-address.wallet-address' as any, addressId, {
        data: {
          balance: newBalance, // 改为string类型
          last_used_at: new Date()
        }
      });
    } catch (error) {
      console.error('更新地址余额失败:', error);
      throw error;
    }
  },

  // 地址轮换策略
  async rotateAddresses() {
    try {
      // 获取所有活跃地址
      const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address' as any, {
        filters: { status: 'active' }
      }) as any[];

      for (const address of addresses) {
        // 检查是否需要轮换
        const shouldRotate = this.shouldRotateAddress(address);
        
        if (shouldRotate) {
          await strapi.entityService.update('api::wallet-address.wallet-address' as any, address.id, {
            data: {
              status: 'maintenance',
              priority: Math.max(1, (address as any).priority - 10) // 降低优先级
            }
          });
          
          console.log(`地址 ${(address as any).address} 已轮换为维护状态`);
        }
      }
    } catch (error) {
      console.error('地址轮换失败:', error);
      throw error;
    }
  },

  // 判断是否需要轮换地址
  shouldRotateAddress(address: any): boolean {
    const now = new Date();
    const lastUsed = address.last_used_at ? new Date(address.last_used_at) : null;
    
    // 轮换条件：
    // 1. 使用次数超过100次
    // 2. 余额超过最大限制的80%
    // 3. 超过24小时未使用
    // 4. 优先级过低
    
    const usageThreshold = 100;
    const maxBalance = parseFloat(address.max_balance || '10000');
    const balanceThreshold = maxBalance * 0.8;
    const currentBalance = parseFloat(address.balance || '0');
    const timeThreshold = 24 * 60 * 60 * 1000; // 24小时
    const priorityThreshold = 20;
    
    return (
      (address.usage_count || 0) > usageThreshold ||
      currentBalance > balanceThreshold ||
      (lastUsed && (now.getTime() - lastUsed.getTime()) > timeThreshold) ||
      (address.priority || 50) < priorityThreshold
    );
  },

  // 批量生成新地址
  async generateNewAddresses(count: number, chain: ChainType, asset: AssetType) {
    try {
      const newAddresses = [];
      
      for (let i = 0; i < count; i++) {
        // 这里应该调用区块链服务生成新地址
        // 暂时使用模拟地址
        const mockAddress = this.generateMockAddress(chain);
        
        const newAddress = await strapi.entityService.create('api::wallet-address.wallet-address' as any, {
          data: {
            address: mockAddress,
            chain,
            asset,
            status: 'active',
            priority: 50,
            description: `自动生成的${chain}链${asset}地址 #${i + 1}`,
            tags: ['auto-generated', chain.toLowerCase(), asset.toLowerCase()]
          }
        });
        
        newAddresses.push(newAddress);
      }
      
      console.log(`成功生成 ${count} 个新的${chain}链${asset}地址`);
      return newAddresses;
    } catch (error) {
      console.error('生成新地址失败:', error);
      throw error;
    }
  },

  // 生成模拟地址（实际应该调用区块链服务）
  generateMockAddress(chain: ChainType): string {
    const prefix = chain === 'BSC' || chain === 'ETH' ? '0x' : 'T';
    const length = chain === 'TRON' ? 34 : 42;
    const chars = '0123456789abcdef';
    let result = prefix;
    
    for (let i = 0; i < length - prefix.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
})); 