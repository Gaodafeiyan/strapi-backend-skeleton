const DingdanSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'dinggou-dingdan', pluralName: 'dinggou-dingdans', displayName: '认购订单' },
  options: { draftAndPublish: false },
  attributes: {
    benjinUSDT    : { type: 'string', required: true },
    zhuangtai     : { type: 'enumeration', enum: ['active','redeemable','finished'], default: 'active' },
    kaishiShiJian : { type: 'datetime', required: true },
    jieshuShiJian : { type: 'datetime', required: true },
    jingtaiShouyi : { type: 'string', default: '0' },
    aiShuliang    : { type: 'string', default: '0' },
    yonghu        : { type: 'relation', relation: 'manyToOne', target: 'plugin::users-permissions.user' },
    jihua         : { type: 'relation', relation: 'manyToOne', target: 'api::dinggou-jihua.dinggou-jihua', inversedBy: 'dingdanList' },
    jiangli       : { type: 'relation', relation: 'oneToOne', target: 'api::yaoqing-jiangli.yaoqing-jiangli' },
    // 添加标准字段名
    amount        : { type: 'decimal', required: true },
    principal     : { type: 'decimal', required: true },
    yield_rate    : { type: 'decimal', required: true },
    cycle_days    : { type: 'integer', required: true },
    start_at      : { type: 'datetime', required: true },
    end_at        : { type: 'datetime', required: true },
    redeemed_at   : { type: 'datetime' },
    payout_amount : { type: 'decimal' },
    status        : { type: 'enumeration', enum: ['pending', 'running', 'finished', 'cancelled'], default: 'pending' },
  },
};
export default DingdanSchema;