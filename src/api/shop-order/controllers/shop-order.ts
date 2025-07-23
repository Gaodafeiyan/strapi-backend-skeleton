import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::shop-order.shop-order',
  ({ strapi }) => ({
    // 创建订单（简化版，用于测试）
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        
        // 如果没有用户认证，使用默认用户ID
        const userId = data.userId || 1;
        
        // 生成订单号
        const orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        const order = await strapi.entityService.create(
          'api::shop-order.shop-order',
          {
            data: {
              orderNumber,
              orderStatus: 'pending',
              quantity: data.quantity || 1,
              unitPrice: data.unitPrice || data.totalAmount,
              totalAmount: data.totalAmount,
              shippingAddress: data.shippingAddress,
              shippingPhone: data.shippingPhone,
              shippingName: data.shippingName,
              notes: data.notes,
              user: userId,
              product: data.productId,
            },
          }
        );
        
        return ctx.send({
          success: true,
          data: order,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 支付订单
    async pay(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;
        
        const order = await strapi
          .service('api::shop-order.shop-order')
          .payOrder(parseInt(id), user.id);
        
        return ctx.send({
          success: true,
          data: order,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 发货
    async ship(ctx) {
      try {
        const { id } = ctx.params;
        const { trackingNumber } = ctx.request.body;
        
        const order = await strapi
          .service('api::shop-order.shop-order')
          .shipOrder(parseInt(id), trackingNumber);
        
        return ctx.send({
          success: true,
          data: order,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 确认收货
    async confirmDelivery(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;
        
        const order = await strapi
          .service('api::shop-order.shop-order')
          .confirmDelivery(parseInt(id), user.id);
        
        return ctx.send({
          success: true,
          data: order,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 取消订单
    async cancel(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;
        
        const order = await strapi
          .service('api::shop-order.shop-order')
          .cancelOrder(parseInt(id), user.id);
        
        return ctx.send({
          success: true,
          data: order,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取我的订单
    async myOrders(ctx) {
      try {
        const { user } = ctx.state;
        const { page = 1, pageSize = 10 } = ctx.query;
        
        const orders = await strapi
          .service('api::shop-order.shop-order')
          .getUserOrders(user.id, parseInt(page as string), parseInt(pageSize as string));
        
        return ctx.send({
          success: true,
          data: orders,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 购物车结算
    async checkoutFromCart(ctx) {
      try {
        const { user } = ctx.state;
        const { cartItemIds, shippingAddress, shippingPhone, shippingName, notes } = ctx.request.body;
        
        if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
          return ctx.badRequest('请选择要购买的商品');
        }
        
        const order = await strapi
          .service('api::shop-order.shop-order')
          .createOrderFromCart(user.id, cartItemIds, {
            shippingAddress,
            shippingPhone,
            shippingName,
            notes,
          });
        
        return ctx.send({
          success: true,
          data: order,
          message: '订单创建成功',
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
); 