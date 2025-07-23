const CacheSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'cache', 
    pluralName: 'caches', 
    displayName: '缓存服务' 
  },
  options: { draftAndPublish: false },
  attributes: {
    // 这是一个虚拟的schema，实际缓存操作通过服务层处理
    key: { type: 'string' },
    value: { type: 'text' },
    ttl: { type: 'integer' }
  },
};

export default CacheSchema; 