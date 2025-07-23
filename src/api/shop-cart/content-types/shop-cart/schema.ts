const ShopCartSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'shop-cart', 
    pluralName: 'shop-carts', 
    displayName: '购物车' 
  },
  options: { draftAndPublish: false },
  attributes: {
    quantity: { 
      type: 'integer', 
      required: true, 
      default: 1 
    }, // 商品数量
    selected: { 
      type: 'boolean', 
      default: true 
    }, // 是否选中
    // 关联关系
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'shopCarts'
    },
    product: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::shop-product.shop-product'
    }
  },
};

export default ShopCartSchema; 