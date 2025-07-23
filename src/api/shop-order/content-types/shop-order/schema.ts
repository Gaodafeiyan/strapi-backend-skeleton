const ShopOrderSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'shop-order', 
    pluralName: 'shop-orders', 
    displayName: '商城订单' 
  },
  options: { draftAndPublish: false },
  attributes: {
    orderNumber: { 
      type: 'string', 
      required: true, 
      unique: true 
    }, // 订单号
    orderStatus: { 
      type: 'enumeration', 
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'], 
      default: 'pending' 
    }, // 订单状态
    quantity: { 
      type: 'integer', 
      required: true 
    }, // 购买数量
    unitPrice: { 
      type: 'decimal', 
      precision: 20, 
      scale: 2, 
      required: true 
    }, // 单价
    totalAmount: { 
      type: 'decimal', 
      precision: 20, 
      scale: 2, 
      required: true 
    }, // 总金额
    shippingAddress: { 
      type: 'text' 
    }, // 收货地址
    shippingPhone: { 
      type: 'string' 
    }, // 收货电话
    shippingName: { 
      type: 'string' 
    }, // 收货人姓名
    trackingNumber: { 
      type: 'string' 
    }, // 物流单号
    notes: { 
      type: 'text' 
    }, // 订单备注
    paidAt: { 
      type: 'datetime' 
    }, // 支付时间
    shippedAt: { 
      type: 'datetime' 
    }, // 发货时间
    deliveredAt: { 
      type: 'datetime' 
    }, // 送达时间
    cancelledAt: { 
      type: 'datetime' 
    }, // 取消时间
    // 关联关系
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'shopOrders'
    },
    product: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::shop-product.shop-product',
      inversedBy: 'shopOrders'
    },
    walletTransaction: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::qianbao-yue.qianbao-yue'
    }
  },
};

export default ShopOrderSchema; 