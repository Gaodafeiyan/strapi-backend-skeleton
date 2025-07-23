const AiTokenSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'ai-token', 
    pluralName: 'ai-tokens', 
    displayName: 'AI代币',
    description: 'AI代币配置信息'
  },
  options: { draftAndPublish: false },
  attributes: {
    name: { 
      type: 'string', 
      required: true,
      unique: true,
      maxLength: 100
    },
    symbol: { 
      type: 'string', 
      required: true,
      unique: true,
      maxLength: 20
    },
    contractAddress: { 
      type: 'string',
      maxLength: 100,
      description: '合约地址 (SPL Token Address)'
    },
    priceSource: { 
      type: 'enumeration',
      enum: ['coingecko', 'binance', 'dexscreener'],
      required: true,
      description: '价格数据源'
    },
    priceApiId: { 
      type: 'string',
      maxLength: 100,
      description: 'API中的代币ID或符号'
    },
    weight: { 
      type: 'integer',
      default: 20,
      min: 1,
      max: 100,
      description: '权重(影响被选中概率)'
    },
    isActive: { 
      type: 'boolean',
      default: true,
      description: '是否启用'
    },
    logoUrl: { 
      type: 'string',
      maxLength: 255,
      description: '代币图标URL'
    },
    description: { 
      type: 'text',
      description: '代币描述'
    },

  },
};

export default AiTokenSchema; 