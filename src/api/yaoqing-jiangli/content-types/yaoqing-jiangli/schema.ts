const JiangliSchema = {
  info: { singularName: 'yaoqing-jiangli', pluralName: 'yaoqing-jianglis', displayName: '邀请奖励' },
  options: { draftAndPublish: false },
  attributes: {
    shouyiUSDT : { type: 'decimal', required: true },
    tuijianRen : { type: 'relation', relation: 'manyToOne',
                   target: 'plugin::users-permissions.user' },
    laiyuanRen : { type: 'relation', relation: 'manyToOne',
                   target: 'plugin::users-permissions.user' },
    laiyuanDan : { type: 'relation', relation: 'oneToOne',
                   target: 'api::dinggou-dingdan.dinggou-dingdan', mappedBy: 'jiangli' },
  },
};
export default JiangliSchema; 