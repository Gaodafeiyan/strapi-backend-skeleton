const ChongzhiSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-chongzhi', pluralName: 'qianbao-chongzhis', displayName: '钱包充值' },
  options: { draftAndPublish: false },
  attributes: {
    amount        : { type: 'decimal', required: true },  // 修复字段名
    currency      : { type: 'enumeration', enum: ['USDT', 'AI_TOKEN'], default: 'USDT' },
    status        : { type: 'enumeration', enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    tx_hash       : { type: 'string' },
    from_address  : { type: 'string' },
    to_address    : { type: 'string' },
    block_number  : { type: 'biginteger' },
    confirmed_at  : { type: 'datetime' },
    yonghu        : { type: 'relation', relation: 'manyToOne', target: 'plugin::users-permissions.user' },
    wallet_address: { type: 'relation', relation: 'manyToOne', target: 'api::wallet-address.wallet-address' },
  },
};
export default ChongzhiSchema;