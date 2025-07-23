export default {
  kind: 'collectionType',
  pluginOptions: { 
    'content-api': { enabled: true },
    'content-manager': { 
      previewable: false 
    }
  },
  info: {
    singularName: 'qianbao-tixian',
    pluralName:  'qianbao-tixians',
    displayName: '钱包提现',
  },
  attributes: {
    txHash:     { type: 'string', unique: true },             // 广播后再写入
    toAddress:  { type: 'string', required: true },
    usdtJine:   { type: 'string', required: true },           // 改为string类型
    zhuangtai:  { type: 'enumeration',
                  enum: ['pending','broadcasted','success','failed'],
                  default: 'pending' },
    yonghu:     { type: 'relation', relation: 'manyToOne',
                  target: 'plugin::users-permissions.user' },
  },
}; 