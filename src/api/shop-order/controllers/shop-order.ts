import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::shop-order.shop-order',
  ({ strapi }) => ({
    // 创建订单
    async create(ctx) {
      try {
        const { user } = ctx.state;
        const { productId, quantity, shippingInfo } = ctx.request.body;
        
        const order = await strapi
          .service('api::shop-order.shop-order')
          .createOrder({
            userId: user.id,
            productId,
            quantity,
            shippingInfo,
          });
        
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
        const { orderStatus, page = 1, limit = 20 } = ctx.query;
        
        const filters: any = {};
        if (orderStatus) {
          filters.orderStatus = orderStatus;
        }
        
        const orders = await strapi
          .service('api::shop-order.shop-order')
          .getUserOrders(user.id, filters);
        
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
        const { cartItemIds, shippingInfo } = ctx.request.body;
        
        if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
          return ctx.badRequest('请选择要购买的商品');
        }
        
        if (!shippingInfo || !shippingInfo.address || !shippingInfo.phone || !shippingInfo.name) {
          return ctx.badRequest('请填写完整的收货信息');
        }
        
        const result = await strapi
          .service('api::shop-order.shop-order')
          .createOrdersFromCart(user.id, cartItemIds, shippingInfo);
        
        return ctx.send({
          success: true,
          data: result,
          message: '订单创建成功',
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
); 