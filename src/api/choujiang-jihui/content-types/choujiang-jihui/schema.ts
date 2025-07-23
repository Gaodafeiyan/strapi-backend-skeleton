const ChoujiangJihuiSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'choujiang-jihui', 
    pluralName: 'choujiang-jihuis', 
    displayName: '抽奖机会' 
  },
  options: { draftAndPublish: false },
  attributes: {
    yonghu: { 
      type: 'relation', 
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user'
    },
    dingdan: { 
      type: 'relation', 
      relation: 'manyToOne',
      target: 'api::dinggou-dingdan.dinggou-dingdan' 
    },
    zongCiShu: { 
      type: 'integer', 
      required: true, 
      default: 0 
    }, // 总抽奖次数
    yiYongCiShu: { 
      type: 'integer', 
      required: true, 
      default: 0 
    }, // 已用抽奖次数
    shengYuCiShu: { 
      type: 'integer', 
      required: true, 
      default: 0 
    }, // 剩余抽奖次数
    zhuangtai: { 
      type: 'enumeration', 
      enum: ['active', 'used', 'expired'], 
      default: 'active' 
    }, // 状态：活跃/已用完/已过期
    daoQiShiJian: { 
      type: 'datetime' 
    }, // 到期时间
    chuangJianShiJian: { 
      type: 'datetime', 
      required: true 
    }, // 创建时间
  },
};

export default ChoujiangJihuiSchema; 