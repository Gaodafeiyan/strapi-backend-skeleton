export default {
  routes: [
    {
      method: 'POST',
      path: '/shop-products',
      handler: 'shop-product.create',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-products',
      handler: 'shop-product.find',
      config: {
        auth: {
          scope: ['public'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-products/:id',
      handler: 'shop-product.findOne',
      config: {
        auth: {
          scope: ['public'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/shop-products/:id',
      handler: 'shop-product.update',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'DELETE',
      path: '/shop-products/:id',
      handler: 'shop-product.delete',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    // 自定义路由
    {
      method: 'GET',
      path: '/shop-products/hot/list',
      handler: 'shop-product.getHotProducts',
      config: {
        auth: {
          scope: ['public'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-products/recommend/list',
      handler: 'shop-product.getRecommendedProducts',
      config: {
        auth: {
          scope: ['public'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-products/search',
      handler: 'shop-product.search',
      config: {
        auth: {
          scope: ['public'],
        },
      },
    },
    {
      method: 'GET',
      path: '/shop-products/categories',
      handler: 'shop-product.getCategories',
      config: {
        auth: {
          scope: ['public'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/shop-products/:id/sales',
      handler: 'shop-product.updateSales',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 