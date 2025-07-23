export default {
  type: 'content-api',
  routes: [
    // 自定义路由 - 必须放在通用路由之前
    {
      method: 'GET',
      path: '/shop-products/hot/list',
      handler: 'shop-product.getHotProducts',
    },
    {
      method: 'GET',
      path: '/shop-products/recommend/list',
      handler: 'shop-product.getRecommendedProducts',
    },
    {
      method: 'GET',
      path: '/shop-products/search',
      handler: 'shop-product.search',
    },
    {
      method: 'GET',
      path: '/shop-products/categories',
      handler: 'shop-product.getCategories',
    },
    {
      method: 'PUT',
      path: '/shop-products/:id/sales',
      handler: 'shop-product.updateSales',
    },
    // 通用路由
    {
      method: 'POST',
      path: '/shop-products',
      handler: 'shop-product.create',
    },
    {
      method: 'GET',
      path: '/shop-products',
      handler: 'shop-product.find',
    },
    {
      method: 'GET',
      path: '/shop-products/:id',
      handler: 'shop-product.findOne',
    },
    {
      method: 'PUT',
      path: '/shop-products/:id',
      handler: 'shop-product.update',
    },
    {
      method: 'DELETE',
      path: '/shop-products/:id',
      handler: 'shop-product.delete',
    },
  ],
}; 