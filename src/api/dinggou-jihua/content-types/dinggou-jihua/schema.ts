import type { Schema } from '@strapi/types';

const JihuaSchema: Schema = {
  info: { singularName: 'dinggou-jihua', pluralName: 'dinggou-jihuas', displayName: '认购计划' },
  options: { draftAndPublish: false },
  attributes: {
    jihuaCode   : { type: 'string',  required: true, unique: true },   // PLAN500 …
    benjinUSDT  : { type: 'decimal', required: true },                 // 500 / 1000 …
    zhouQiTian  : { type: 'integer', required: true },                 // 15 / 20 …
    jingtaiBili : { type: 'decimal', required: true },                 // 6 / 7 …
    aiBili      : { type: 'decimal', required: true },                 // 3 / 4 …
    choujiangCi : { type: 'integer',  default: 3 },
    kaiqi       : { type: 'boolean',  default: true },
    dingdanList : { type: 'relation', relation: 'oneToMany',
                    target: 'api::dinggou-dingdan.dinggou-dingdan', mappedBy: 'jihua' },
  },
};
export default JihuaSchema; 