import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::qianbao-chongzhi.qianbao-chongzhi', ({ strapi }) => ({
  // 标准create方法
  async create(ctx) {
    const { data } = ctx.request.body;
    
    try {
      const recharge = await strapi.entityService.create('api::qianbao-chongzhi.qianbao-chongzhi', {
        data: {
          ...data,
          zhuangtai: 'pending'
        }
      });
      
      ctx.body = { data: recharge };
    } catch (error) {
      ctx.throw(500, `创建充值记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 获取充值地址 - 动态分配
  async getDepositAddress(ctx) {
    try {
      const { chain = 'BSC', asset = 'USDT' } = ctx.query;
      const userId = ctx.state.user?.id;
      
      // 直接查询钱包地址，不使用服务方法
      const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address' as any, {
        filters: {
          chain,
          asset,
          wallet_status: 'active',
          balance: {
            $lt: '10000'
          }
        },
        sort: [
          { priority: 'desc' },
          { usage_count: 'asc' },
          { last_used_at: 'asc' }
        ],
        limit: 1
      });

      if (addresses.length === 0) {
        return ctx.notFound(`没有可用的${chain}链${asset}充值地址`);
      }

      const bestAddress = addresses[0];
      
      // 更新使用统计
      await strapi.entityService.update('api::wallet-address.wallet-address' as any, bestAddress.id, {
        data: {
          usage_count: (bestAddress as any).usage_count + 1,
          last_used_at: new Date()
        }
      });
      
      ctx.body = {
        success: true,
        data: {
          address: (bestAddress as any).address,
          chain: (bestAddress as any).chain,
          asset: (bestAddress as any).asset,
          description: (bestAddress as any).description
        }
      };
    } catch (error) {
      ctx.throw(500, `获取充值地址失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 获取所有充值地址（管理员用）
  async getAllAddresses(ctx) {
    try {
      const { chain, asset, status } = ctx.query;
      
      const filters: any = {};
      if (chain) filters.chain = chain;
      if (asset) filters.asset = asset;
      if (status) filters.status = status;
      
      const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address', {
        filters,
        sort: { priority: 'desc' }
      });
      
      ctx.body = {
        success: true,
        data: addresses
      };
    } catch (error) {
      ctx.throw(500, `获取地址列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 手动轮换地址（管理员用）
  async rotateAddresses(ctx) {
    try {
      const walletAddressService = strapi.service('api::wallet-address.wallet-address');
      await walletAddressService.rotateAddresses();
      
      ctx.body = {
        success: true,
        message: '地址轮换完成'
      };
    } catch (error) {
      ctx.throw(500, `地址轮换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 生成新地址（管理员用）
  async generateAddresses(ctx) {
    try {
      const { count = 10, chain = 'BSC', asset = 'USDT' } = ctx.request.body;
      
      const walletAddressService = strapi.service('api::wallet-address.wallet-address');
      const newAddresses = await walletAddressService.generateNewAddresses(count, chain, asset);
      
      ctx.body = {
        success: true,
        data: newAddresses,
        message: `成功生成 ${count} 个新地址`
      };
    } catch (error) {
      ctx.throw(500, `生成地址失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 标准find方法
  async find(ctx) {
    try {
      const recharges = await strapi.entityService.findMany('api::qianbao-chongzhi.qianbao-chongzhi', {
        ...ctx.query,
        populate: ['yonghu']
      });
      
      ctx.body = { data: recharges };
    } catch (error) {
      ctx.throw(500, `查询充值记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 自定义方法可以在这里添加
  async createRecharge(ctx) {
    const { txHash, usdtJine, yonghu } = ctx.request.body;
    
    try {
      const recharge = await strapi.entityService.create('api::qianbao-chongzhi.qianbao-chongzhi', {
        data: {
          txHash,
          usdtJine,
          zhuangtai: 'pending',
          yonghu
        }
      });
      
      ctx.body = { success: true, data: recharge };
    } catch (error) {
      ctx.throw(500, `创建充值记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  async confirmRecharge(ctx) {
    const { id } = ctx.params;
    
    try {
      const recharge = await strapi.entityService.findOne('api::qianbao-chongzhi.qianbao-chongzhi', id, {
        populate: ['yonghu']
      });
      
      if (!recharge) {
        return ctx.notFound('充值记录不存在');
      }
      
      if (recharge.zhuangtai === 'success') {
        return ctx.badRequest('充值已确认');
      }
      
      // 更新状态为成功
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', id, {
        data: { zhuangtai: 'success' }
      });
      
      // 增加用户余额
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        (recharge as any).yonghu.id, 
        (recharge as any).usdtJine.toString()
      );
      
      ctx.body = { success: true, message: '充值确认成功' };
    } catch (error) {
      ctx.throw(500, `确认充值失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
})); 