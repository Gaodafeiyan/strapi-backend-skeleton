const fs = require('fs');
const path = require('path');

// 修复钱包地址schema中的枚举值
function fixWalletAddressSchema() {
  const schemaPath = path.join(__dirname, 'src/api/wallet-address/content-types/wallet-address/schema.ts');
  
  const schemaContent = `import { factories } from '@strapi/strapi';

export default {
  kind: 'collectionType',
  collectionName: 'wallet_addresses',
  options: {
    draftAndPublish: false,
  },
  pluginOptions: { 
    'content-api': { enabled: true },
    'content-manager': { 
      previewable: false 
    }
  },
  info: {
    singularName: 'wallet-address',
    pluralName: 'wallet-addresses',
    displayName: '钱包地址',
    description: '热钱包地址池管理',
  },
  attributes: {
    address: {
      type: 'string',
      required: true,
      unique: true,
      minLength: 26,  // 降低最小长度，支持TRON地址
      maxLength: 42,  // 保持最大长度
    },
    chain: {
      type: 'enumeration',
      enum: ['ethereum', 'bsc', 'tron', 'polygon', 'arbitrum'],  // 修复枚举值
      required: true,
      default: 'ethereum',
    },
    asset: {
      type: 'enumeration',
      enum: ['USDT', 'AI_TOKEN', 'ETH', 'BNB'],
      required: true,
      default: 'USDT',
    },
    wallet_status: {  // 改名为wallet_status避免与Strapi内部status冲突
      type: 'enumeration',
      enum: ['active', 'inactive', 'maintenance'],
      required: true,
      default: 'active',
    },
    priority: {
      type: 'integer',
      min: 1,
      max: 100,
      default: 50,
    },
    usage_count: {
      type: 'integer',
      default: 0,
    },
    last_used_at: {
      type: 'datetime',
    },
    balance: {
      type: 'string',
      default: '0',
    },
    max_balance: {
      type: 'string',
      default: '10000',
    },
    private_key: {
      type: 'text',
      private: true,
    },
    description: {
      type: 'text',
    },
    tags: {
      type: 'json',
    },
  },
};`;

  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ 钱包地址schema枚举值已修复');
}

// 修复投资订单schema中的字段名
function fixInvestmentOrderSchema() {
  const schemaPath = path.join(__dirname, 'src/api/dinggou-dingdan/content-types/dinggou-dingdan/schema.ts');
  
  const schemaContent = `const DingdanSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'dinggou-dingdan', pluralName: 'dinggou-dingdans', displayName: '认购订单' },
  options: { draftAndPublish: false },
  attributes: {
    benjinUSDT    : { type: 'string', required: true },
    zhuangtai     : { type: 'enumeration', enum: ['active','redeemable','finished'], default: 'active' },
    kaishiShiJian : { type: 'datetime', required: true },
    jieshuShiJian : { type: 'datetime', required: true },
    jingtaiShouyi : { type: 'string', default: '0' },
    aiShuliang    : { type: 'string', default: '0' },
    yonghu        : { type: 'relation', relation: 'manyToOne',
                      target: 'plugin::users-permissions.user', inversedBy: 'dinggouOrders' },
    jihua         : { type: 'relation', relation: 'manyToOne',
                      target: 'api::dinggou-jihua.dinggou-jihua', inversedBy: 'dingdanList' },
    jiangli       : { type: 'relation', relation: 'oneToOne',
                      target: 'api::yaoqing-jiangli.yaoqing-jiangli' },
    // 添加标准字段名
    amount        : { type: 'decimal', required: true },
    principal     : { type: 'decimal', required: true },
    yield_rate    : { type: 'decimal', required: true },
    cycle_days    : { type: 'integer', required: true },
    start_at      : { type: 'datetime', required: true },
    end_at        : { type: 'datetime', required: true },
    redeemed_at   : { type: 'datetime' },
    payout_amount : { type: 'decimal' },
    status        : { type: 'enumeration', enum: ['pending', 'running', 'finished', 'cancelled'], default: 'pending' },
  },
};
export default DingdanSchema;`;

  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ 投资订单schema字段名已修复');
}

// 修复充值记录schema
function fixRechargeSchema() {
  const schemaPath = path.join(__dirname, 'src/api/qianbao-chongzhi/content-types/qianbao-chongzhi/schema.ts');
  
  const schemaContent = `const ChongzhiSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-chongzhi', pluralName: 'qianbao-chongzhis', displayName: '钱包充值' },
  options: { draftAndPublish: false },
  attributes: {
    amount        : { type: 'decimal', required: true },  // 修复字段名
    currency      : { type: 'enumeration', enum: ['USDT', 'AI_TOKEN'], default: 'USDT' },
    status        : { type: 'enumeration', enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    tx_hash       : { type: 'string' },
    from_address  : { type: 'string' },
    to_address    : { type: 'string' },
    block_number  : { type: 'biginteger' },
    confirmed_at  : { type: 'datetime' },
    yonghu        : { type: 'relation', relation: 'manyToOne',
                      target: 'plugin::users-permissions.user', inversedBy: 'chongzhiRecords' },
    wallet_address: { type: 'relation', relation: 'manyToOne',
                      target: 'api::wallet-address.wallet-address' },
  },
};
export default ChongzhiSchema;`;

  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ 充值记录schema字段名已修复');
}

// 修复提现记录schema
function fixWithdrawSchema() {
  const schemaPath = path.join(__dirname, 'src/api/qianbao-tixian/content-types/qianbao-tixian/schema.ts');
  
  const schemaContent = `const TixianSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-tixian', pluralName: 'qianbao-tixians', displayName: '钱包提现' },
  options: { draftAndPublish: false },
  attributes: {
    amount        : { type: 'decimal', required: true },  // 修复字段名
    currency      : { type: 'enumeration', enum: ['USDT', 'AI_TOKEN'], default: 'USDT' },
    status        : { type: 'enumeration', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    tx_hash       : { type: 'string' },
    to_address    : { type: 'string', required: true },
    from_address  : { type: 'string' },
    block_number  : { type: 'biginteger' },
    completed_at  : { type: 'datetime' },
    yonghu        : { type: 'relation', relation: 'manyToOne',
                      target: 'plugin::users-permissions.user', inversedBy: 'tixianRecords' },
    wallet_address: { type: 'relation', relation: 'manyToOne',
                      target: 'api::wallet-address.wallet-address' },
  },
};
export default TixianSchema;`;

  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ 提现记录schema字段名已修复');
}

// 修复投资计划schema
function fixInvestmentPlanSchema() {
  const schemaPath = path.join(__dirname, 'src/api/dinggou-jihua/content-types/dinggou-jihua/schema.ts');
  
  const schemaContent = `const JihuaSchema = {
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
export default JihuaSchema;`;

  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ 投资计划schema字段名已修复');
}

// 主函数
function main() {
  try {
    console.log('🔧 开始修复数据验证问题...');
    
    // 修复各种schema
    fixWalletAddressSchema();
    fixInvestmentOrderSchema();
    fixRechargeSchema();
    fixWithdrawSchema();
    fixInvestmentPlanSchema();
    
    console.log('🎉 数据验证问题修复完成！');
    console.log('💡 请重启Strapi服务器以使更改生效');
    console.log('📝 修复内容:');
    console.log('   - 钱包地址chain枚举值: ethereum, bsc, tron, polygon, arbitrum');
    console.log('   - 投资订单字段名: amount, principal, yield_rate, cycle_days');
    console.log('   - 充值记录字段名: amount');
    console.log('   - 提现记录字段名: amount');
    console.log('   - 投资计划字段名: amount, yield_rate, cycle_days');
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

main(); 