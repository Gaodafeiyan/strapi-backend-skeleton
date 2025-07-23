import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService(
  'api::shop-order.shop-order',
  ({ strapi }) => ({
    // 创建订单
    async createOrder(userId: number, productId: number, quantity: number, options: {
      shippingAddress?: string;
      shippingPhone?: string;
      shippingName?: string;
      notes?: string;
    } = {}) {
      // 检查商品是否存在
      const product = await strapi.entityService.findOne(
        'api::shop-product.shop-product',
        productId
      ) as any;
      
      if (!product) {
        throw new Error('商品不存在');
      }
      
      if (!product.publishedAt) {
        throw new Error('商品未上架');
      }
      
      if (product.productStock < quantity) {
        throw new Error('商品库存不足');
      }
      
      const unitPrice = new Decimal(product.productPrice);
      const totalAmount = unitPrice.times(quantity);
      
      // 检查用户钱包余额
      const wallets = await strapi.entityService.findMany(
        'api::qianbao-yue.qianbao-yue',
        { filters: { yonghu: { id: userId } } }
      ) as any[];
      
      if (!wallets || wallets.length === 0) {
        throw new Error('钱包不存在');
      }
      
      const wallet = wallets[0];
      const walletBalance = new Decimal(wallet.usdtYue || 0);
      
      if (walletBalance.lessThan(totalAmount)) {
        throw new Error('USDT余额不足');
      }
      
      // 生成订单号
      const orderNumber = `SHOP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // 扣除钱包余额
      await strapi.service('api::qianbao-yue.qianbao-yue').deductBalance(
        userId,
        totalAmount.toFixed(2)
      );
      
      // 减少商品库存
      await strapi.entityService.update(
        'api::shop-product.shop-product',
        productId,
        {
          data: {
            stockQuantity: product.stockQuantity - quantity,
          },
        }
      );
      
      // 创建订单
      const order = await strapi.entityService.create('api::shop-order.shop-order', {
        data: {
          orderNumber,
          quantity,
          unitPrice: unitPrice.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          user: userId,
          product: productId,
          shippingAddress: options.shippingAddress,
          shippingPhone: options.shippingPhone,
          shippingName: options.shippingName,
          notes: options.notes,
        },
      });
      
      return order;
    },
    
    // 从购物车创建订单
    async createOrderFromCart(userId: number, cartItemIds: number[], options: {
      shippingAddress?: string;
      shippingPhone?: string;
      shippingName?: string;
      notes?: string;
    } = {}) {
      // 获取购物车商品
      const cartItems = await strapi.entityService.findMany(
        'api::shop-cart.shop-cart',
        {
          filters: {
            id: { $in: cartItemIds },
            user: { id: { $eq: userId } },
            selected: true,
          },
          populate: ['product'],
        }
      );
      
      if (cartItems.length === 0) {
        throw new Error('没有选中的商品');
      }
      
      let totalAmount = new Decimal(0);
      const orderItems = [];
      
      // 验证库存和计算总金额
      for (const cartItem of cartItems) {
        const itemData = cartItem as any;
        const product = itemData.product;
        const quantity = itemData.quantity || 0;
        
        if (!product) {
          throw new Error('商品信息不完整');
        }
        
        if (product.productStock < quantity) {
          throw new Error(`商品 ${product.productName} 库存不足`);
        }
        
        const itemTotal = new Decimal(product.productPrice).times(quantity);
        totalAmount = totalAmount.plus(itemTotal);
        
        orderItems.push({
          product,
          quantity,
          unitPrice: product.productPrice,
          itemTotal: itemTotal.toFixed(2),
        });
      }
      
      // 检查钱包余额
      const wallets = await strapi.entityService.findMany(
        'api::qianbao-yue.qianbao-yue',
        { filters: { yonghu: { id: userId } } }
      ) as any[];
      
      if (!wallets || wallets.length === 0) {
        throw new Error('钱包不存在');
      }
      
      const wallet = wallets[0];
      const walletBalance = new Decimal(wallet.usdtYue || 0);
      
      if (walletBalance.lessThan(totalAmount)) {
        throw new Error('USDT余额不足');
      }
      
      // 扣除钱包余额
      await strapi.service('api::qianbao-yue.qianbao-yue').deductBalance(
        userId,
        totalAmount.toFixed(2)
      );
      
      // 减少商品库存
      for (const item of orderItems) {
        await strapi.entityService.update(
          'api::shop-product.shop-product',
          item.product.id,
          {
            data: {
              stockQuantity: item.product.stockQuantity - item.quantity,
            },
          }
        );
      }
      
      // 创建订单
      const orderNumber = `SHOP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const order = await strapi.entityService.create('api::shop-order.shop-order', {
        data: {
          orderNumber,
          quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
          unitPrice: orderItems[0].unitPrice,
          totalAmount: totalAmount.toFixed(2),
          user: userId,
          product: orderItems[0].product.id, // 暂时只关联第一个商品
          shippingAddress: options.shippingAddress,
          shippingPhone: options.shippingPhone,
          shippingName: options.shippingName,
          notes: options.notes,
        },
      });
      
      // 删除已购买的购物车商品
      await strapi.service('api::shop-cart.shop-cart').removeFromCart(
        cartItemIds[0],
        userId
      );
      
      return order;
    },
    
    // 获取用户订单列表
    async getUserOrders(userId: number, page: number = 1, pageSize: number = 10) {
      const orders = await strapi.entityService.findMany(
        'api::shop-order.shop-order',
        {
          filters: {
            user: { id: { $eq: userId } },
          },
          populate: ['product'],
          sort: { createdAt: 'desc' },
          pagination: {
            page,
            pageSize,
          },
        }
      );
      
      const total = await strapi.entityService.count('api::shop-order.shop-order', {
        filters: {
          user: { id: { $eq: userId } },
        },
      });
      
      return {
        data: orders,
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      };
    },
    
    // 获取订单详情
    async getOrderDetail(orderId: number, userId: number) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId,
        {
          populate: ['product'],
        }
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      // 检查用户权限
      const orderData = order as any;
      if (orderData.user?.id !== userId) {
        throw new Error('无权查看此订单');
      }
      
      return order;
    },
    
    // 取消订单
    async cancelOrder(orderId: number, userId: number) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId,
        {
          populate: ['product'],
        }
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      // 检查用户权限
      const orderData = order as any;
      if (orderData.user?.id !== userId) {
        throw new Error('无权操作此订单');
      }
      
      if (orderData.orderStatus !== 'pending') {
        throw new Error('订单状态不允许取消');
      }
      
      // 退还钱包余额
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        userId,
        orderData.totalAmount,
        '0'
      );
      
      // 恢复商品库存
      const product = orderData.product;
      if (product) {
        await strapi.entityService.update(
          'api::shop-product.shop-product',
          product.id,
          {
            data: {
              stockQuantity: product.stockQuantity + orderData.quantity,
            },
          }
        );
      }
      
      // 更新订单状态
      return await strapi.entityService.update(
        'api::shop-order.shop-order',
        orderId,
        {
          data: {
            orderStatus: 'cancelled',
            cancelledAt: new Date(),
          },
        }
      );
    },
    
    // 确认收货
    async confirmDelivery(orderId: number, userId: number) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId,
        {
          populate: ['product'],
        }
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      // 检查用户权限
      const orderData = order as any;
      if (orderData.user?.id !== userId) {
        throw new Error('无权操作此订单');
      }
      
      if (orderData.orderStatus !== 'shipped') {
        throw new Error('订单状态不允许确认收货');
      }
      
      // 更新订单状态
      return await strapi.entityService.update(
        'api::shop-order.shop-order',
        orderId,
        {
          data: {
            orderStatus: 'delivered',
            deliveredAt: new Date(),
          },
        }
      );
    },
    
    // 获取所有订单（管理员）
    async getAllOrders(page: number = 1, pageSize: number = 10, filters: any = {}) {
      const query: any = {
        populate: ['user', 'product'],
        sort: { createdAt: 'desc' },
        pagination: {
          page,
          pageSize,
        },
      };
      
      if (Object.keys(filters).length > 0) {
        query.filters = filters;
      }
      
      const orders = await strapi.entityService.findMany(
        'api::shop-order.shop-order',
        query
      );
      
      const total = await strapi.entityService.count('api::shop-order.shop-order', {
        filters: filters,
      });
      
      return {
        data: orders,
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      };
    },
    
    // 支付订单
    async payOrder(orderId: number, userId: number) {
      const order = await strapi.entityService.findOne(
        'api::shop-order.shop-order',
        orderId,
        {
          populate: ['product'],
        }
      );
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      // 检查用户权限
      const orderData = order as any;
      if (orderData.user?.id !== userId) {
        throw new Error('无权操作此订单');
      }
      
      if (orderData.orderStatus !== 'pending') {
        throw new Error('订单状态不允许支付');
      }
      
      // 更新订单状态
      return await strapi.entityService.update(
        'api::shop-order.shop-order',
        orderId,
        {
          data: {
            orderStatus: 'paid',
            paidAt: new Date(),
          },
        }
      );
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
      
      if ((order as any).orderStatus !== 'paid') {
        throw new Error('订单状态不允许发货');
      }
      
      return await strapi.entityService.update(
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
    },
  })
); 