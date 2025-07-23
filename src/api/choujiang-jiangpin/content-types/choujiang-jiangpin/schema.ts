const ChoujiangJiangpinSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'choujiang-jiangpin', 
    pluralName: 'choujiang-jiangpins', 
    displayName: '抽奖奖品' 
  },
  options: { draftAndPublish: false },
  attributes: {
    jiangpinMing: { 
      type: 'string', 
      required: true 
    }, // 奖品名称
    jiangpinMiaoShu: { 
      type: 'text' 
    }, // 奖品描述
    jiangpinTuPian: { 
      type: 'string' 
    }, // 奖品图片URL
    jiangpinLeiXing: { 
      type: 'enumeration', 
      enum: ['USDT', 'AI_TOKEN', 'WU_PIN'], 
      default: 'USDT' 
    }, // 奖品类型：USDT/AI代币/实物
    jiangpinJiaZhi: { 
      type: 'string', 
      required: true, 
      default: '0' 
    }, // 奖品价值
    zhongJiangGaiLv: { 
      type: 'decimal', 
      required: true, 
      default: 0 
    }, // 中奖概率 (0-100)
    kuCunShuLiang: { 
      type: 'integer', 
      required: true, 
      default: 0 
    }, // 库存数量
    yiFaChuShuLiang: { 
      type: 'integer', 
      required: true, 
      default: 0 
    }, // 已发出数量
    paiXuShunXu: { 
      type: 'integer', 
      default: 0 
    }, // 排序顺序
    kaiQi: { 
      type: 'boolean', 
      default: true 
    }, // 是否开启
    teBieJiangPin: { 
      type: 'boolean', 
      default: false 
    }, // 是否特别奖品（特殊显示）
  },
};

export default ChoujiangJiangpinSchema; 