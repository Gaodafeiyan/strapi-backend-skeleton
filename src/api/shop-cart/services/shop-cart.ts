import { factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::shop-cart.shop-cart',
  ({ strapi }) => ({
    // 添加到购物车
    async addToCart(userId: number, productId: number, quantity: number = 1) {
      // 检查商品是否已在购物车中
      const existingCart = await strapi.entityService.findMany(
        'api::shop-cart.shop-cart',
        {
          filters: {
            user: userId,
            product: productId,
          },
        }
      );
      
      if (existingCart.length > 0) {
        // 更新数量
        const cartItem = existingCart[0];
        const newQuantity = cartItem.quantity + quantity;
        
        return await strapi.entityService.update(
          'api::shop-cart.shop-cart',
          cartItem.id,
          {
            data: {
              quantity: newQuantity,
            },
          }
        );
      } else {
        // 创建新的购物车项
        return await strapi.entityService.create('api::shop-cart.shop-cart', {
          data: {
            user: userId,
            product: productId,
            quantity,
            selected: true,
          },
        });
      }
    },
    
    // 更新购物车商品数量
    async updateQuantity(cartId: number, userId: number, quantity: number) {
      const cartItem = await strapi.entityService.findOne(
        'api::shop-cart.shop-cart',
        cartId,
        { populate: ['user'] }
      );
      
      if (!cartItem) {
        throw new Error('购物车商品不存在');
      }
      
      if (cartItem.user.id !== userId) {
        throw new Error('无权操作此购物车商品');
      }
      
      if (quantity <= 0) {
        // 删除购物车商品
        return await strapi.entityService.delete(
          'api::shop-cart.shop-cart',
          cartId
        );
      }
      
      return await strapi.entityService.update(
        'api::shop-cart.shop-cart',
        cartId,
        {
          data: {
            quantity,
          },
        }
      );
    },
    
    // 删除购物车商品
    async removeFromCart(cartId: number, userId: number) {
      const cartItem = await strapi.entityService.findOne(
        'api::shop-cart.shop-cart',
        cartId,
        { populate: ['user'] }
      );
      
      if (!cartItem) {
        throw new Error('购物车商品不存在');
      }
      
      if (cartItem.user.id !== userId) {
        throw new Error('无权操作此购物车商品');
      }
      
      return await strapi.entityService.delete(
        'api::shop-cart.shop-cart',
        cartId
      );
    },
    
    // 切换商品选中状态
    async toggleSelected(cartId: number, userId: number) {
      const cartItem = await strapi.entityService.findOne(
        'api::shop-cart.shop-cart',
        cartId,
        { populate: ['user'] }
      );
      
      if (!cartItem) {
        throw new Error('购物车商品不存在');
      }
      
      if (cartItem.user.id !== userId) {
        throw new Error('无权操作此购物车商品');
      }
      
      return await strapi.entityService.update(
        'api::shop-cart.shop-cart',
        cartId,
        {
          data: {
            selected: !cartItem.selected,
          },
        }
      );
    },
    
    // 全选/取消全选
    async toggleAllSelected(userId: number, selected: boolean) {
      const cartItems = await strapi.entityService.findMany(
        'api::shop-cart.shop-cart',
        {
          filters: {
            user: userId,
          },
        }
      );
      
      const updatePromises = cartItems.map((item) =>
        strapi.entityService.update(
          'api::shop-cart.shop-cart',
          item.id,
          {
            data: {
              selected,
            },
          }
        )
      );
      
      return await Promise.all(updatePromises);
    },
    
    // 获取用户购物车
    async getUserCart(userId: number) {
      return await strapi.entityService.findMany(
        'api::shop-cart.shop-cart',
        {
          filters: {
            user: userId,
          },
          populate: ['product'],
          sort: { createdAt: 'desc' },
        }
      );
    },
    
    // 清空购物车
    async clearCart(userId: number) {
      const cartItems = await strapi.entityService.findMany(
        'api::shop-cart.shop-cart',
        {
          filters: {
            user: userId,
          },
        }
      );
      
      const deletePromises = cartItems.map((item) =>
        strapi.entityService.delete(
          'api::shop-cart.shop-cart',
          item.id
        )
      );
      
      return await Promise.all(deletePromises);
    },
    
    // 获取购物车统计信息
    async getCartStats(userId: number) {
      const cartItems = await strapi.entityService.findMany(
        'api::shop-cart.shop-cart',
        {
          filters: {
            user: userId,
          },
          populate: ['product'],
        }
      );
      
      let totalItems = 0;
      let totalAmount = 0;
      let selectedItems = 0;
      let selectedAmount = 0;
      
      cartItems.forEach((item) => {
        totalItems += item.quantity;
        totalAmount += item.product.productPrice * item.quantity;
        
        if (item.selected) {
          selectedItems += item.quantity;
          selectedAmount += item.product.productPrice * item.quantity;
        }
      });
      
      return {
        totalItems,
        totalAmount,
        selectedItems,
        selectedAmount,
        cartItemCount: cartItems.length,
      };
    },
  })
); 