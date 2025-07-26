const JihuaSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'dinggou-jihua', pluralName: 'dinggou-jihuas', displayName: '认购计划' },
  options: { draftAndPublish: false },
  attributes: {
    name          : { type: 'string', required: true },
    amount        : { type: 'decimal', required: true },  // 修复字段名
    yield_rate    : { type: 'decimal', required: true },
    cycle_days    : { type: 'integer', required: true },
    max_slots     : { type: 'integer', default: 100 },
    current_slots : { type: 'integer', default: 0 },
    status        : { type: 'enumeration', enum: ['active', 'inactive'], default: 'active' },
    start_date    : { type: 'datetime' },
    end_date      : { type: 'datetime' },
    description   : { type: 'text' },
    dingdanList   : { type: 'relation', relation: 'oneToMany',
                      target: 'api::dinggou-dingdan.dinggou-dingdan', mappedBy: 'jihua' },
  },
};
export default JihuaSchema;