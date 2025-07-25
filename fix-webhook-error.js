#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复webhook错误...');

// 检查webhook目录结构
const webhookDir = path.join(__dirname, 'src', 'api', 'webhook');
const contentTypesDir = path.join(webhookDir, 'content-types', 'webhook');

// 确保目录存在
if (!fs.existsSync(contentTypesDir)) {
  fs.mkdirSync(contentTypesDir, { recursive: true });
  console.log('✅ 创建content-types目录');
}

// 创建schema.json文件
const schemaPath = path.join(contentTypesDir, 'schema.json');
const schema = {
  "kind": "collectionType",
  "collectionName": "webhooks",
  "info": {
    "singularName": "webhook",
    "pluralName": "webhooks",
    "displayName": "Webhook",
    "description": "Webhook for handling external transactions"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "txHash": {
      "type": "string",
      "required": true
    },
    "status": {
      "type": "string",
      "required": true
    },
    "type": {
      "type": "string",
      "required": true
    },
    "processed": {
      "type": "boolean",
      "default": false
    }
  }
};

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('✅ 创建webhook schema.json');

// 检查并修复控制器
const controllerPath = path.join(webhookDir, 'controllers', 'webhook.ts');
if (fs.existsSync(controllerPath)) {
  const controllerContent = `export default {
  // Webhook统一处理转入/转出txHash
  async handleTransaction(ctx) {
    const { txHash, status, type } = ctx.request.body;
    
    if (!txHash || !status || !type) {
      return ctx.badRequest('缺少必要参数: txHash, status, type');
    }

    try {
      const result = await strapi.service('api::webhook.webhook').processTransaction(txHash, status, type);
      
      ctx.body = { 
        success: true, 
        message: result.message,
        txHash 
      };
    } catch (error) {
      ctx.throw(500, \`处理交易失败: \${error instanceof Error ? error.message : '未知错误'}\`);
    }
  }
};`;

  fs.writeFileSync(controllerPath, controllerContent);
  console.log('✅ 修复webhook控制器');
}

// 检查并修复服务
const servicePath = path.join(webhookDir, 'services', 'webhook.ts');
if (fs.existsSync(servicePath)) {
  const serviceContent = `import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::webhook.webhook' as any, ({ strapi }) => ({
  // 处理交易webhook
  async processTransaction(txHash, status, type) {
    try {
      // 幂等性检查
      const existingRecharge = await strapi.entityService.findMany('api::qianbao-chongzhi.qianbao-chongzhi', {
        filters: { txHash, zhuangtai: 'success' }
      });

      const existingWithdrawal = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
        filters: { txHash, zhuangtai: 'success' }
      });

      if (existingRecharge.length > 0 || existingWithdrawal.length > 0) {
        throw new Error('该交易已处理，避免重复操作');
      }

      if (type === 'recharge') {
        await this.handleRechargeConfirmation(txHash, status);
      } else if (type === 'withdrawal') {
        await this.handleWithdrawalConfirmation(txHash, status);
      } else {
        throw new Error('无效的交易类型');
      }

      return { success: true, message: \`\${type} 交易处理成功\` };
    } catch (error) {
      throw new Error(\`处理交易失败: \${error instanceof Error ? error.message : '未知错误'}\`);
    }
  },

  // 处理充值确认
  async handleRechargeConfirmation(txHash, status) {
    const recharges = await strapi.entityService.findMany('api::qianbao-chongzhi.qianbao-chongzhi', {
      filters: { txHash, zhuangtai: 'pending' },
      populate: ['yonghu']
    });

    if (recharges.length === 0) {
      throw new Error('未找到待确认的充值记录');
    }

    const recharge = recharges[0];

    if (status === 'success') {
      // 更新状态为成功
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', recharge.id, {
        data: { zhuangtai: 'success' }
      });

      // 增加用户余额
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        recharge.yonghu.id, 
        recharge.usdtJine.toString()
      );

      console.log(\`充值确认成功: txHash=\${txHash}, 用户=\${recharge.yonghu.id}, 金额=\${recharge.usdtJine}\`);
    } else if (status === 'failed') {
      // 更新状态为失败
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', recharge.id, {
        data: { zhuangtai: 'failed' }
      });

      console.log(\`充值失败: txHash=\${txHash}, 用户=\${recharge.yonghu.id}\`);
    }
  },

  // 处理提现确认
  async handleWithdrawalConfirmation(txHash, status) {
    const withdrawals = await strapi.entityService.findMany('api::qianbao-tixian.qianbao-tixian', {
      filters: { txHash, zhuangtai: 'broadcasted' },
      populate: ['yonghu']
    });

    if (withdrawals.length === 0) {
      throw new Error('未找到待确认的提现记录');
    }

    const withdrawal = withdrawals[0];

    if (status === 'success') {
      // 更新状态为成功
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawal.id, {
        data: { zhuangtai: 'success' }
      });

      console.log(\`提现确认成功: txHash=\${txHash}, 用户=\${withdrawal.yonghu.id}, 金额=\${withdrawal.usdtJine}\`);
    } else if (status === 'failed') {
      // 更新状态为失败并返还余额
      await strapi.entityService.update('api::qianbao-tixian.qianbao-tixian', withdrawal.id, {
        data: { zhuangtai: 'failed' }
      });

      // 返还用户余额
      await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
        withdrawal.yonghu.id, 
        withdrawal.usdtJine.toString()
      );

      console.log(\`提现失败，已返还余额: txHash=\${txHash}, 用户=\${withdrawal.yonghu.id}, 金额=\${withdrawal.usdtJine}\`);
    }
  }
}));`;

  fs.writeFileSync(servicePath, serviceContent);
  console.log('✅ 修复webhook服务');
}

console.log('🎉 webhook错误修复完成！');
console.log('现在可以重新启动Strapi服务了。'); 