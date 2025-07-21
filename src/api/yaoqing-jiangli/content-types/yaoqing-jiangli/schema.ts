const JiangliSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'yaoqing-jiangli', pluralName: 'yaoqing-jianglis', displayName: '邀请奖励' },
  options: { draftAndPublish: false },
  attributes: {
    shouyiUSDT : { type: 'decimal', required: true },
    tuijianRen : { type: 'relation', relation: 'manyToOne',
                   target: 'plugin::users-permissions.user', inversedBy: 'tuijianJiangli' },
    laiyuanRen : { type: 'relation', relation: 'manyToOne',
                   target: 'plugin::users-permissions.user', inversedBy: 'laiyuanJiangli' },
    laiyuanDan : { type: 'relation', relation: 'oneToOne',
                   target: 'api::dinggou-dingdan.dinggou-dingdan', mappedBy: 'jiangli' },
  },
};
export default JiangliSchema; 