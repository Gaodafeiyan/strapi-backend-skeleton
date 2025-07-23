import { factories } from '@strapi/strapi';

export default {
  kind: 'collectionType',
  collectionName: 'wallet_addresses',
  info: {
    singularName: 'wallet-address',
    pluralName: 'wallet-addresses',
    displayName: '钱包地址',
    description: '热钱包地址池管理',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    i18n: {
      localized: true,
    },
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
      type: 'decimal',
      precision: 18,
      scale: 6,
      default: 0,
    },
    max_balance: {
      type: 'decimal',
      precision: 18,
      scale: 6,
      default: 10000,
    },
    private_key: {
      type: 'text',
      private: true, // 加密存储
    },
    description: {
      type: 'text',
    },
    tags: {
      type: 'json',
    },
  },
}; 