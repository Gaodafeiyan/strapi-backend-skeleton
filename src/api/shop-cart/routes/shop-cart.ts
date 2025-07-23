export default {
  routes: [
    {
      method: 'POST',
      path: '/shop-carts',
      handler: 'shop-cart.create',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-carts',
      handler: 'shop-cart.find',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-carts/:id',
      handler: 'shop-cart.findOne',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/shop-carts/:id',
      handler: 'shop-cart.update',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'DELETE',
      path: '/shop-carts/:id',
      handler: 'shop-cart.delete',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    // 自定义路由
    {
      method: 'POST',
      path: '/shop-carts/add-to-cart',
      handler: 'shop-cart.addToCart',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/shop-carts/:id/quantity',
      handler: 'shop-cart.updateQuantity',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'DELETE',
      path: '/shop-carts/:id/remove',
      handler: 'shop-cart.removeFromCart',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/shop-carts/:id/toggle-selected',
      handler: 'shop-cart.toggleSelected',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/shop-carts/toggle-all-selected',
      handler: 'shop-cart.toggleAllSelected',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-carts/my/cart',
      handler: 'shop-cart.myCart',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'DELETE',
      path: '/shop-carts/my/clear',
      handler: 'shop-cart.clearCart',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-carts/my/stats',
      handler: 'shop-cart.cartStats',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 