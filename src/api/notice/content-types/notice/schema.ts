const NoticeSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'notice', 
    pluralName: 'notices', 
    displayName: 'Notice',
    description: '系统公告'
  },
  options: { draftAndPublish: true },
  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 255
    },
    content: {
      type: 'richtext',
      required: true
    },
    type: {
      type: 'enumeration',
      enum: [
        'info',
        'warning',
        'success',
        'error'
      ],
      default: 'info'
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    publishDate: {
      type: 'datetime'
    },
    expireDate: {
      type: 'datetime'
    },
    priority: {
      type: 'integer',
      default: 0,
      min: 0,
      max: 10
    }
  },
};

export default NoticeSchema; 