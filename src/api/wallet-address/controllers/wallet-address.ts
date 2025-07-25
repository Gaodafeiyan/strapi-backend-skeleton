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
        
        const { address, type, label } = data;
        
        if (!address) {
          return ctx.badRequest('钱包地址不能为空');
        }
        
        if (!type) {
          return ctx.badRequest('钱包类型不能为空');
        }
        
        // 创建钱包地址
        const walletAddress = await strapi.entityService.create('api::wallet-address.wallet-address', {
          data: {
            address,
            type,
            label: label || '',
            yonghu: ctx.state.user.id
          }
        });
        
        ctx.body = { data: walletAddress };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },
  })
); 