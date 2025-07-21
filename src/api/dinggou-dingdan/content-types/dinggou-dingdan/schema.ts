import type { Schema } from '@strapi/strapi';

const DingdanSchema: Schema = {
  info: { singularName: 'dinggou-dingdan', pluralName: 'dinggou-dingdans', displayName: '认购订单' },
  options: { draftAndPublish: false },
  attributes: {
    benjinUSDT    : { type: 'decimal', required: true },
    zhuangtai     : { type: 'enumeration', enum: ['active','finished'], default: 'active' },
    kaishiShiJian : { type: 'datetime', required: true },
    jieshuShiJian : { type: 'datetime', required: true },
    jingtaiShouyi : { type: 'decimal', default: 0 },
    aiShuliang    : { type: 'decimal', default: 0 },
    yonghu        : { type: 'relation', relation: 'manyToOne',
                      target: 'plugin::users-permissions.user', inversedBy: 'dinggouOrders' },
    jihua         : { type: 'relation', relation: 'manyToOne',
                      target: 'api::dinggou-jihua.dinggou-jihua', inversedBy: 'dingdanList' },
    jiangli       : { type: 'relation', relation: 'oneToOne',
                      target: 'api::yaoqing-jiangli.yaoqing-jiangli' },
  },
};
export default DingdanSchema; 