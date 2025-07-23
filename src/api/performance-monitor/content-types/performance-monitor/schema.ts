const PerformanceMonitorSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'performance-monitor', 
    pluralName: 'performance-monitors', 
    displayName: '性能监控',
    description: '系统性能监控配置'
  },
  options: { draftAndPublish: false },
  attributes: {
    name: { 
      type: 'string',
      maxLength: 100
    },
    cpuThreshold: { 
      type: 'integer',
      default: 80,
      min: 0,
      max: 100,
      description: 'CPU使用率阈值'
    },
    memoryThreshold: { 
      type: 'integer',
      default: 85,
      min: 0,
      max: 100,
      description: '内存使用率阈值'
    },
    errorRateThreshold: { 
      type: 'decimal',
      default: 5.0,
      min: 0,
      max: 100,
      description: '错误率阈值'
    },
    responseTimeThreshold: { 
      type: 'integer',
      default: 2000,
      min: 0,
      description: '响应时间阈值(ms)'
    },
    enabled: { 
      type: 'boolean',
      default: true,
      description: '是否启用监控'
    }
  },
};

export default PerformanceMonitorSchema; 