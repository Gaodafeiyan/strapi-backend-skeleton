const QianbaoSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-yue', pluralName: 'qianbao-yues', displayName: '钱包余额' },
  options: { draftAndPublish: false },
  attributes: {
    usdtYue : { type: 'decimal', default: 0 },
    aiYue   : { type: 'decimal', default: 0 },
    yonghu  : { type: 'relation', relation: 'oneToOne',
                target: 'plugin::users-permissions.user', inversedBy: 'qianbao' },
  },
};
export default QianbaoSchema; 