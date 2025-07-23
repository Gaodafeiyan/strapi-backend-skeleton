import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::wallet-address.wallet-address' as any, ({ strapi }) => ({
  // 继承默认的CRUD操作
  async find(ctx) {
    try {
      const addresses = await strapi.entityService.findMany('api::wallet-address.wallet-address' as any, {
        ...ctx.query,
        sort: { priority: 'desc' }
      });
      
      ctx.body = { data: addresses };
    } catch (error) {
      ctx.throw(500, `查询钱包地址失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const address = await strapi.entityService.findOne('api::wallet-address.wallet-address' as any, id);
      
      if (!address) {
        return ctx.notFound('钱包地址不存在');
      }
      
      ctx.body = { data: address };
    } catch (error) {
      ctx.throw(500, `查询钱包地址失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 获取最佳地址
  async getBestAddress(ctx) {
    try {
      const { chain, asset } = ctx.params;
      const userId = ctx.state.user?.id;
      
      const walletAddressService = strapi.service('api::wallet-address.wallet-address');
      const bestAddress = await walletAddressService.getBestDepositAddress(chain, asset, userId);
      
      ctx.body = {
        success: true,
        data: bestAddress
      };
    } catch (error) {
      ctx.throw(500, `获取最佳地址失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  // 轮换地址
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

  // 生成新地址
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
  }
})); 