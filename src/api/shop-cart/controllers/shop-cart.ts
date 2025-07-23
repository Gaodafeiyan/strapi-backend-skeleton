import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::shop-cart.shop-cart',
  ({ strapi }) => ({
    // 创建购物车项目（简化版，用于测试）
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        
        // 如果没有用户认证，使用默认用户ID
        const userId = data.userId || 1;
        
        const cartItem = await strapi.entityService.create(
          'api::shop-cart.shop-cart',
          {
            data: {
              quantity: data.quantity || 1,
              selected: data.selected !== false,
              user: userId,
              product: data.productId,
            },
          }
        );
        
        return ctx.send({
          success: true,
          data: cartItem,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    // 添加到购物车
    async addToCart(ctx) {
      try {
        const { user } = ctx.state;
        const { productId, quantity = 1 } = ctx.request.body;
        
        const cartItem = await strapi
          .service('api::shop-cart.shop-cart')
          .addToCart(user.id, productId, quantity);
        
        return ctx.send({
          success: true,
          data: cartItem,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 更新购物车商品数量
    async updateQuantity(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;
        const { quantity } = ctx.request.body;
        
        const cartItem = await strapi
          .service('api::shop-cart.shop-cart')
          .updateQuantity(parseInt(id), user.id, quantity);
        
        return ctx.send({
          success: true,
          data: cartItem,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 删除购物车商品
    async removeFromCart(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;
        
        await strapi
          .service('api::shop-cart.shop-cart')
          .removeFromCart(parseInt(id), user.id);
        
        return ctx.send({
          success: true,
          message: '商品已从购物车移除',
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 切换商品选中状态
    async toggleSelected(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;
        
        const cartItem = await strapi
          .service('api::shop-cart.shop-cart')
          .toggleSelected(parseInt(id), user.id);
        
        return ctx.send({
          success: true,
          data: cartItem,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 全选/取消全选
    async toggleAllSelected(ctx) {
      try {
        const { user } = ctx.state;
        const { selected } = ctx.request.body;
        
        const cartItems = await strapi
          .service('api::shop-cart.shop-cart')
          .toggleAllSelected(user.id, selected);
        
        return ctx.send({
          success: true,
          data: cartItems,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取我的购物车
    async myCart(ctx) {
      try {
        const { user } = ctx.state;
        
        const cartItems = await strapi
          .service('api::shop-cart.shop-cart')
          .getUserCart(user.id);
        
        return ctx.send({
          success: true,
          data: cartItems,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 清空购物车
    async clearCart(ctx) {
      try {
        const { user } = ctx.state;
        
        await strapi
          .service('api::shop-cart.shop-cart')
          .clearCart(user.id);
        
        return ctx.send({
          success: true,
          message: '购物车已清空',
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取购物车统计信息
    async cartStats(ctx) {
      try {
        const { user } = ctx.state;
        
        const stats = await strapi
          .service('api::shop-cart.shop-cart')
          .getCartStats(user.id);
        
        return ctx.send({
          success: true,
          data: stats,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
); 