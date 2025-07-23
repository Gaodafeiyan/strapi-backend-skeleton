const HealthSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'health', 
    pluralName: 'healths', 
    displayName: '健康检查' 
  },
  options: { draftAndPublish: false },
  attributes: {
    // 这是一个虚拟的schema，实际健康检查通过控制器处理
    status: { type: 'string' },
    timestamp: { type: 'datetime' }
  },
};

export default HealthSchema; 