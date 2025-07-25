# 🔧 Webhook错误修复指南

## 🚨 问题描述

Strapi启动时出现以下错误：
```
TypeError: Error creating endpoint POST /webhook/transaction: Cannot read properties of undefined (reading 'kind')
```

## 🔍 问题原因

这个错误是因为webhook API缺少必要的content-types定义。在Strapi中，每个API都需要有对应的schema.json文件来定义数据结构。

## ✅ 解决方案

### 方法1：使用修复脚本（推荐）

在服务器上运行以下命令：

```bash
# 给脚本执行权限
chmod +x quick-webhook-fix.sh

# 运行修复脚本
./quick-webhook-fix.sh
```

### 方法2：手动修复

#### 1. 创建content-types目录
```bash
mkdir -p src/api/webhook/content-types/webhook
```

#### 2. 创建schema.json文件
```bash
cat > src/api/webhook/content-types/webhook/schema.json << 'EOF'
{
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
}
EOF
```

#### 3. 修复控制器
```bash
cat > src/api/webhook/controllers/webhook.ts << 'EOF'
export default {
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
      ctx.throw(500, `处理交易失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
};
EOF
```

#### 4. 修复服务
```bash
cat > src/api/webhook/services/webhook.ts << 'EOF'
import { factories } from '@strapi/strapi';

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

      return { success: true, message: `${type} 交易处理成功` };
    } catch (error) {
      throw new Error(`处理交易失败: ${error instanceof Error ? error.message : '未知错误'}`);
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

      console.log(`充值确认成功: txHash=${txHash}, 用户=${recharge.yonghu.id}, 金额=${recharge.usdtJine}`);
    } else if (status === 'failed') {
      // 更新状态为失败
      await strapi.entityService.update('api::qianbao-chongzhi.qianbao-chongzhi', recharge.id, {
        data: { zhuangtai: 'failed' }
      });

      console.log(`充值失败: txHash=${txHash}, 用户=${recharge.yonghu.id}`);
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

      console.log(`提现确认成功: txHash=${txHash}, 用户=${withdrawal.yonghu.id}, 金额=${withdrawal.usdtJine}`);
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

      console.log(`提现失败，已返还余额: txHash=${txHash}, 用户=${withdrawal.yonghu.id}, 金额=${withdrawal.usdtJine}`);
    }
  }
}));
EOF
```

## 🚀 重新启动服务

修复完成后，重新启动Strapi服务：

```bash
# 停止当前服务（如果正在运行）
# Ctrl+C

# 重新启动
npm run develop
```

## ✅ 验证修复

启动成功后，您应该看到：
- 没有webhook相关的错误
- 服务正常启动
- 可以访问 `/webhook/transaction` 端点

## 📝 注意事项

1. **备份重要数据**：修复前建议备份重要数据
2. **测试功能**：修复后测试webhook功能是否正常
3. **监控日志**：观察启动日志，确保没有其他错误

## 🆘 如果仍有问题

如果修复后仍有问题，请：

1. 检查文件权限
2. 确认文件路径正确
3. 查看详细错误日志
4. 联系技术支持

---

**修复完成后，您的Strapi后端应该能够正常启动！** 🎉 