const TixianSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-tixian', pluralName: 'qianbao-tixians', displayName: '钱包提现' },
  options: { draftAndPublish: false },
  attributes: {
    amount        : { type: 'decimal', required: true },  // 修复字段名
    currency      : { type: 'enumeration', enum: ['USDT', 'AI_TOKEN'], default: 'USDT' },
    status        : { type: 'enumeration', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    tx_hash       : { type: 'string' },
    to_address    : { type: 'string', required: true },
    from_address  : { type: 'string' },
    block_number  : { type: 'biginteger' },
    completed_at  : { type: 'datetime' },
    yonghu        : { type: 'relation', relation: 'manyToOne',
                      target: 'plugin::users-permissions.user', inversedBy: 'tixianRecords' },
    wallet_address: { type: 'relation', relation: 'manyToOne',
                      target: 'api::wallet-address.wallet-address' },
  },
};
export default TixianSchema;