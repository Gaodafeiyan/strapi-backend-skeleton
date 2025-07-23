const ShopProductSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'shop-product', 
    pluralName: 'shop-products', 
    displayName: '商城商品' 
  },
  options: { draftAndPublish: true },
  attributes: {
    productName: { 
      type: 'string', 
      required: true 
    }, // 商品名称
    productDescription: { 
      type: 'text' 
    }, // 商品描述
    productImages: { 
      type: 'media', 
      multiple: true 
    }, // 商品图片
    productCategory: { 
      type: 'enumeration', 
      enum: ['SHANG_PIN', 'JIN_BI', 'YOU_HUI_QUAN'], 
      default: 'SHANG_PIN' 
    }, // 商品类型：商品/金币/优惠券
    productPrice: { 
      type: 'decimal', 
      precision: 20, 
      scale: 2, 
      required: true 
    }, // 商品价格
    originalPrice: { 
      type: 'decimal', 
      precision: 20, 
      scale: 2 
    }, // 原价
    stockQuantity: { 
      type: 'integer', 
      required: true, 
      default: 0 
    }, // 库存数量
    soldQuantity: { 
      type: 'integer', 
      required: true, 
      default: 0 
    }, // 已售数量
    productStatus: { 
      type: 'enumeration', 
      enum: ['active', 'inactive', 'out_of_stock'], 
      default: 'active' 
    }, // 商品状态
    productTags: { 
      type: 'json' 
    }, // 商品标签
    productSpecs: { 
      type: 'json' 
    }, // 商品规格
    sortOrder: { 
      type: 'integer', 
      default: 0 
    }, // 排序顺序
    isHot: { 
      type: 'boolean', 
      default: false 
    }, // 是否热门
    isNew: { 
      type: 'boolean', 
      default: false 
    }, // 是否新品
    isRecommend: { 
      type: 'boolean', 
      default: false 
    }, // 是否推荐
    // 关联关系
    shopOrders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::shop-order.shop-order',
      mappedBy: 'product'
    }
  },
};

export default ShopProductSchema; 