import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::shop-order.shop-order',
  ({ strapi }) => ({
    // 创建订单
    async createOrder(data: any) {
      const { userId, productId, quantity, shippingInfo } = data;
      
      // 获取商品信息
      const product = await strapi.entityService.findOne(
        'api::shop-product.shop-product',
        productId,
        { populate: '*' }
      );
      
      if (!product) {
        throw new Error('商品不存在');
      }
      
      // 检查库存
      if (product.stockQuantity < quantity) {
        throw new Error('库存不足');
      }
      
      // 计算总金额
      const totalAmount = new Decimal(product.productPrice)
        .mul(quantity)
        .toFixed(2);
      
      // 生成订单号
      const orderNumber = `SO${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // 创建订单
      const order = await strapi.entityService.create('api::shop-order.shop-order', {
        data: {
          orderNumber,
          orderStatus: 'pending',
          quantity,
          unitPrice: product.productPrice,
          totalAmount,
          shippingAddress: shippingInfo.address,
          shippingPhone: shippingInfo.phone,
          shippingName: shippingInfo.name,
          notes: shippingInfo.notes,
          user: userId,
          product: productId,
        },
      });
      
      return order;
    },
    
    // 批量创建订单（购物车结算）
    async createOrdersFromCart(userId: number, cartItemIds: number[], shippingInfo: any) {
      // 获取购物车商品
      const cartItems = await strapi.entityService.findMany(
        'api::shop-cart.shop-cart',
        {
          filters: {
            id: { $in: cartItemIds },
            user: userId,
            selected: true,
          },
          populate: ['product'],
        }
      );
      
      if (cartItems.length === 0) {
        throw new Error('没有选中的商品');
      }
      
      // 检查库存
      for (const cartItem of cartItems) {
        if (cartItem.product.stockQuantity < cartItem.quantity) {
          throw new Error(`商品 ${cartItem.product.productName} 库存不足`);
        }
      }
      
      // 计算总金额
      let totalAmount = new Decimal(0);
      for (const cartItem of cartItems) {
        totalAmount = totalAmount.add(
          new Decimal(cartItem.product.productPrice).mul(cartItem.quantity)
        );
      }
      
      // 检查用户钱包余额
      const wallets = await strapi.entityService.findMany(
        'api::qianbao-yue.qianbao-yue',
        { filters: { yonghu: userId } }
      );
      
      if (wallets.length === 0) {
        throw new Error('用户钱包不存在');
      }
      
      const wallet = wallets[0];
      const currentBalance = new Decimal(wallet.usdtYue || 0);
      
      if (currentBalance.lessThan(totalAmount)) {
        throw new Error('钱包余额不足');
      }
      
      // 创建订单
      const orders = [];
      for (const cartItem of cartItems) {
        const orderNumber = `SO${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const itemTotalAmount = new Decimal(cartItem.product.productPrice)
          .mul(cartItem.quantity)
          .toFixed(2);
        
        const order = await strapi.entityService.create('api::shop-order.shop-order', {
          data: {
            orderNumber,
            orderStatus: 'pending',
            quantity: cartItem.quantity,
            unitPrice: cartItem.product.productPrice,
            totalAmount: itemTotalAmount,
            shippingAddress: shippingInfo.address,
            shippingPhone: shippingInfo.phone,
            shippingName: shippingInfo.name,
            notes: shippingInfo.notes,
            user: userId,
            product: cartItem.product.id,
          },
        });
        
        orders.push(order);
      }
      
      // 扣除钱包余额
      const newBalance = currentBalance.minus(totalAmount).toFixed(2);
      await strapi.entityService.update(
        'api::qianbao-yue.qianbao-yue',
        wallet.id,
        { data: { usdtYue: newBalance } }
      );
      
      // 更新商品库存
      for (const cartItem of cartItems) {
        await strapi.entityService.update(
          'api::shop-product.shop-product',
          cartItem.product.id,
          {
            data: {
              stockQuantity: cartItem.product.stockQuantity - cartItem.quantity,
              soldQuantity: cartItem.product.soldQuantity + cartItem.quantity,
            },
          }
        );
      }
      
      // 删除购物车商品
      for (const cartItem of cartItems) {
        await strapi.entityService.delete(
          'api::shop-cart.shop-cart',
          cartItem.id
        );
      }
      
      // 更新订单状态为已支付
      for (const order of orders) {
        await strapi.entityService.update(
          'api::shop-order.shop-order',
          order.id,
          {
            data: {
              orderStatus: 'paid',
              paidAt: new Date(),
            },
          }
        );
      }
      
      return {
        orders,
        totalAmount: totalAmount.toFixed(2),
      };
    },
    
    // 支付订单
    async payOrder(orderId: number, userId: number) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId,
        { populate: ['user', 'product'] }
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      if (order.user.id !== userId) {
        throw new Error('无权操作此订单');
      }
      
      if (order.orderStatus !== 'pending') {
        throw new Error('订单状态不正确');
      }
      
      // 检查用户钱包余额
      const wallets = await strapi.entityService.findMany(
        'api::qianbao-yue.qianbao-yue',
        { filters: { yonghu: userId } }
      );
      
      if (wallets.length === 0) {
        throw new Error('用户钱包不存在');
      }
      
      const wallet = wallets[0];
      const currentBalance = new Decimal(wallet.usdtYue || 0);
      const orderAmount = new Decimal(order.totalAmount);
      
      if (currentBalance.lessThan(orderAmount)) {
        throw new Error('钱包余额不足');
      }
      
      // 扣除钱包余额
      const newBalance = currentBalance.minus(orderAmount).toFixed(2);
      await strapi.entityService.update(
        'api::qianbao-yue.qianbao-yue',
        wallet.id,
        { data: { usdtYue: newBalance } }
      );
      
      // 更新商品库存
      await strapi.entityService.update(
        'api::shop-product.shop-product',
        order.product.id,
        {
          data: {
            stockQuantity: order.product.stockQuantity - order.quantity,
            soldQuantity: order.product.soldQuantity + order.quantity,
          },
        }
      );
      
      // 更新订单状态
      const updatedOrder = await strapi.entityService.update(
        'api::shop-order.shop-order',
        orderId,
        {
          data: {
            orderStatus: 'paid',
            paidAt: new Date(),
          },
        }
      );
      
      return updatedOrder;
    },
    
    // 发货
    async shipOrder(orderId: number, trackingNumber: string) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      if (order.orderStatus !== 'paid') {
        throw new Error('订单状态不正确');
      }
      
      const updatedOrder = await strapi.entityService.update(
        'api::shop-order.shop-order',
        orderId,
        {
          data: {
            orderStatus: 'shipped',
            trackingNumber,
            shippedAt: new Date(),
          },
        }
      );
      
      return updatedOrder;
    },
    
    // 确认收货
    async confirmDelivery(orderId: number, userId: number) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId,
        { populate: ['user'] }
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      if (order.user.id !== userId) {
        throw new Error('无权操作此订单');
      }
      
      if (order.orderStatus !== 'shipped') {
        throw new Error('订单状态不正确');
      }
      
      const updatedOrder = await strapi.entityService.update(
        'api::shop-order.shop-order',
        orderId,
        {
          data: {
            orderStatus: 'delivered',
            deliveredAt: new Date(),
          },
        }
      );
      
      return updatedOrder;
    },
    
    // 取消订单
    async cancelOrder(orderId: number, userId: number) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId,
        { populate: ['user', 'product'] }
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      if (order.user.id !== userId) {
        throw new Error('无权操作此订单');
      }
      
      if (order.orderStatus !== 'pending') {
        throw new Error('订单状态不正确');
      }
      
      const updatedOrder = await strapi.entityService.update(
        'api::shop-order.shop-order',
        orderId,
        {
          data: {
            orderStatus: 'cancelled',
            cancelledAt: new Date(),
          },
        }
      );
      
      return updatedOrder;
    },
    
    // 获取用户订单列表
    async getUserOrders(userId: number, filters: any = {}) {
      const query = {
        filters: { user: userId, ...filters },
        populate: ['product'],
        sort: { createdAt: 'desc' },
      };
      
      return await strapi.entityService.findMany(
        'api::shop-order.shop-order',
        query
      );
    },
  })
); 