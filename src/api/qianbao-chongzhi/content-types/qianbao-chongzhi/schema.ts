const QianbaoChongzhiSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-chongzhi', pluralName: 'qianbao-chongzhis', displayName: '钱包充值' },
  options: { draftAndPublish: false },
  attributes: {
    user        : { type: 'relation', relation: 'manyToOne', target: 'plugin::users-permissions.user' },
    amount      : { type: 'decimal', required: true },
    currency    : { type: 'enumeration', enum: ['USDT', 'AI_TOKEN'], default: 'USDT' },
    status      : { type: 'enumeration', enum: ['pending', 'completed', 'failed'], default: 'pending' },
    tx_hash     : { type: 'string' },
    from_address: { type: 'string' },
    to_address  : { type: 'string' },
    block_number: { type: 'biginteger' },
    completed_at: { type: 'datetime' },
  },
};
export default QianbaoChongzhiSchema;