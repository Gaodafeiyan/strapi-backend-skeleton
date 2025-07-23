export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/shop-carts',
      handler: 'shop-cart.create',
    },
    {
      method: 'GET',
      path: '/shop-carts',
      handler: 'shop-cart.find',
    },
    {
      method: 'GET',
      path: '/shop-carts/:id',
      handler: 'shop-cart.findOne',
    },
    {
      method: 'PUT',
      path: '/shop-carts/:id',
      handler: 'shop-cart.update',
    },
    {
      method: 'DELETE',
      path: '/shop-carts/:id',
      handler: 'shop-cart.delete',
    },
    // 自定义路由
    {
      method: 'POST',
      path: '/shop-carts/add-to-cart',
      handler: 'shop-cart.addToCart',
    },
    {
      method: 'PUT',
      path: '/shop-carts/:id/quantity',
      handler: 'shop-cart.updateQuantity',
    },
    {
      method: 'DELETE',
      path: '/shop-carts/:id/remove',
      handler: 'shop-cart.removeFromCart',
    },
    {
      method: 'POST',
      path: '/shop-carts/:id/toggle-selected',
      handler: 'shop-cart.toggleSelected',
    },
    {
      method: 'POST',
      path: '/shop-carts/toggle-all-selected',
      handler: 'shop-cart.toggleAllSelected',
    },
    {
      method: 'GET',
      path: '/shop-carts/my/cart',
      handler: 'shop-cart.myCart',
    },
    {
      method: 'DELETE',
      path: '/shop-carts/my/clear',
      handler: 'shop-cart.clearCart',
    },
    {
      method: 'GET',
      path: '/shop-carts/my/stats',
      handler: 'shop-cart.cartStats',
    },
  ],
}; 