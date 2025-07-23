import type { Schema } from '@strapi/strapi';

export default {
  kind: 'collectionType',
  pluginOptions: { 
    'content-api': { enabled: true },
    'content-manager': { 
      previewable: false 
    }
  },
  options: {
    draftAndPublish: false,
  },
  info: {
    singularName: 'qianbao-chongzhi',
    pluralName:  'qianbao-chongzhis',
    displayName: '钱包充值',
  },
  attributes: {
    txHash:     { type: 'string', unique: true, required: true },
    usdtJine:   { type: 'string', required: true },            // 改为string类型
    zhuangtai:  { type: 'enumeration', enum: ['pending','success','failed'], default: 'pending' },
    yonghu:     { type: 'relation', relation: 'manyToOne', target: 'plugin::users-permissions.user' },
  },
}; 