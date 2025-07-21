const YonghuSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
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
    dinggouOrders : { type: 'relation', relation: 'oneToMany',
                      target: 'api::dinggou-dingdan.dinggou-dingdan', mappedBy: 'yonghu' },
  },
};
export default YonghuSchema; 