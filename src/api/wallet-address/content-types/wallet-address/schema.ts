import { factories } from '@strapi/strapi';

export default {
  kind: 'collectionType',
  collectionName: 'wallet_addresses',
  pluginOptions: { 
    'content-api': { enabled: true },
    'content-manager': { 
      previewable: false 
    }
  },
  info: {
    singularName: 'wallet-address',
    pluralName: 'wallet-addresses',
    displayName: '钱包地址',
    description: '热钱包地址池管理',
  },
  attributes: {
    address: {
      type: 'string',
      required: true,
      unique: true,
      minLength: 42,
      maxLength: 42,
    },
    chain: {
      type: 'enumeration',
      enum: ['BSC', 'ETH', 'TRON'],
      required: true,
      default: 'BSC',
    },
    asset: {
      type: 'enumeration',
      enum: ['USDT', 'AI_TOKEN', 'ETH', 'BNB'],
      required: true,
      default: 'USDT',
    },
    status: {
      type: 'enumeration',
      enum: ['active', 'inactive', 'maintenance'],
      required: true,
      default: 'active',
    },
    priority: {
      type: 'integer',
      min: 1,
      max: 100,
      default: 50,
    },
    usage_count: {
      type: 'integer',
      default: 0,
    },
    last_used_at: {
      type: 'datetime',
    },
    balance: {
      type: 'string',                    // 改为string类型
      default: '0',
    },
    max_balance: {
      type: 'string',                    // 改为string类型
      default: '10000',
    },
    private_key: {
      type: 'text',
      private: true,
    },
    description: {
      type: 'text',
    },
    tags: {
      type: 'json',
    },
  },
}; 