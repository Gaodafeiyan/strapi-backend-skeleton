const QianbaoTixianSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-tixian', pluralName: 'qianbao-tixians', displayName: '钱包提现' },
  options: { draftAndPublish: false },
  attributes: {
    user        : { type: 'relation', relation: 'manyToOne', target: 'plugin::users-permissions.user' },
    wallet_address: { type: 'relation', relation: 'manyToOne', target: 'api::wallet-address.wallet-address' },
    amount      : { type: 'decimal', required: true },
    status      : { type: 'enumeration', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    tx_hash     : { type: 'string' },
    block_number: { type: 'integer' },
    completed_at: { type: 'datetime' },
  },
};
export default QianbaoTixianSchema;