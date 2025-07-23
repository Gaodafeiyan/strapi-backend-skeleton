export default {
  routes: [
    {
      method: 'POST',
      path: '/shop-orders',
      handler: 'shop-order.create',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-orders',
      handler: 'shop-order.find',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-orders/:id',
      handler: 'shop-order.findOne',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/shop-orders/:id',
      handler: 'shop-order.update',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'DELETE',
      path: '/shop-orders/:id',
      handler: 'shop-order.delete',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    // 自定义路由
    {
      method: 'POST',
      path: '/shop-orders/:id/pay',
      handler: 'shop-order.pay',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/shop-orders/:id/ship',
      handler: 'shop-order.ship',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/shop-orders/:id/confirm-delivery',
      handler: 'shop-order.confirmDelivery',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/shop-orders/:id/cancel',
      handler: 'shop-order.cancel',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-orders/my/orders',
      handler: 'shop-order.myOrders',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/shop-orders/checkout-from-cart',
      handler: 'shop-order.checkoutFromCart',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 