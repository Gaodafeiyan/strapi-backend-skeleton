import type { Schema } from '@strapi/strapi';

const YonghuSchema: Schema = {
  info: { singularName: 'user', pluralName: 'users', displayName: '用户扩展' },
  options: { draftAndPublish: false },
  attributes: {
    yaoqingMa : { type: 'string',  unique: true, configurable: false },            // 自己的邀请码
    shangji   : { type: 'relation', relation: 'manyToOne',
                  target: 'plugin::users-permissions.user', inversedBy: 'xiaji' },
    xiaji     : { type: 'relation', relation: 'oneToMany',
                  target: 'plugin::users-permissions.user', mappedBy: 'shangji' },
    qianbao   : { type: 'relation', relation: 'oneToOne',
                  target: 'api::qianbao-yue.qianbao-yue', configurable: false },
  },
};
export default YonghuSchema; 