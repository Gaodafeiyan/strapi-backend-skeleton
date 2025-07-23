const TokenRewardRecordSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'token-reward-record', 
    pluralName: 'token-reward-records', 
    displayName: '代币赠送记录',
    description: 'AI代币赠送记录'
  },
  options: { draftAndPublish: false },
  attributes: {
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user'
    },
    order: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::dinggou-dingdan.dinggou-dingdan'
    },
    token: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::ai-token.ai-token'
    },
    amount: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 999999999.99999999,
      description: '赠送数量'
    },
    usdtValue: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 999999.99,
      description: 'USDT价值'
    },
    tokenPrice: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 999999.99999999,
      description: '代币价格'
    },
    createdAt: {
      type: 'datetime',
      description: '创建时间'
    }
  },
};

export default TokenRewardRecordSchema; 