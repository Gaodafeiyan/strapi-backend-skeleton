const InternalMessageSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'internal-message', 
    pluralName: 'internal-messages', 
    displayName: '站内消息',
    description: '用户站内消息系统'
  },
  options: { draftAndPublish: false },
  attributes: {
    title: { 
      type: 'string', 
      required: true,
      maxLength: 255
    },
    content: { 
      type: 'text', 
      required: true
    },
    type: { 
      type: 'enumeration',
      enum: ['system', 'notification', 'promotion'],
      default: 'system',
      description: '消息类型'
    },
    priority: { 
      type: 'enumeration',
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      description: '消息优先级'
    },
    isRead: { 
      type: 'boolean',
      default: false,
      description: '是否已读'
    },
    readAt: { 
      type: 'datetime',
      description: '阅读时间'
    },
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'internal_messages',
      description: '接收用户'
    }
  },
};

export default InternalMessageSchema; 