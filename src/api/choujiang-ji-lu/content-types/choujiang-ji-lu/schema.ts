const ChoujiangJiLuSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'choujiang-ji-lu', 
    pluralName: 'choujiang-ji-lus', 
    displayName: '抽奖记录' 
  },
  options: { draftAndPublish: false },
  attributes: {
    yonghu: { 
      type: 'relation', 
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user', 
      inversedBy: 'choujiangJiLus' 
    },
    jiangpin: { 
      type: 'relation', 
      relation: 'manyToOne',
      target: 'api::choujiang-jiangpin.choujiang-jiangpin' 
    },
    choujiangJihui: { 
      type: 'relation', 
      relation: 'manyToOne',
      target: 'api::choujiang-jihui.choujiang-jihui' 
    },
    dingdan: { 
      type: 'relation', 
      relation: 'manyToOne',
      target: 'api::dinggou-dingdan.dinggou-dingdan' 
    },
    chouJiangShiJian: { 
      type: 'datetime', 
      required: true 
    }, // 抽奖时间
    jiangPinMing: { 
      type: 'string', 
      required: true 
    }, // 奖品名称
    jiangPinJiaZhi: { 
      type: 'string', 
      required: true 
    }, // 奖品价值
    jiangPinLeiXing: { 
      type: 'enumeration', 
      enum: ['USDT', 'AI_TOKEN', 'WU_PIN'], 
      required: true 
    }, // 奖品类型
    zhuangtai: { 
      type: 'enumeration', 
      enum: ['zhongJiang', 'weiLingQu', 'yiLingQu', 'yiGuoQi'], 
      default: 'zhongJiang' 
    }, // 状态：中奖/未领取/已领取/已过期
    lingQuShiJian: { 
      type: 'datetime' 
    }, // 领取时间
    beiZhu: { 
      type: 'text' 
    }, // 备注信息
  },
};

export default ChoujiangJiLuSchema; 