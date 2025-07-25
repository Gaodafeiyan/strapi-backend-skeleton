const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复后端API路由配置问题...');

// 修复 ai-token 路由
const aiTokenRoutePath = path.join(__dirname, 'src/api/ai-token/routes/ai-token.ts');
if (fs.existsSync(aiTokenRoutePath)) {
  let content = fs.readFileSync(aiTokenRoutePath, 'utf8');
  
  if (!content.includes("type: 'content-api'")) {
    content = content.replace(
      'export default {',
      "export default {\n  type: 'content-api',"
    );
    fs.writeFileSync(aiTokenRoutePath, content);
    console.log('✅ 修复 ai-token 路由配置');
  } else {
    console.log('ℹ️  ai-token 路由配置已正确');
  }
}

// 修复 choujiang-ji-lu 路由
const choujiangRoutePath = path.join(__dirname, 'src/api/choujiang-ji-lu/routes/choujiang-ji-lu.ts');
if (fs.existsSync(choujiangRoutePath)) {
  let content = fs.readFileSync(choujiangRoutePath, 'utf8');
  
  if (!content.includes("type: 'content-api'")) {
    content = content.replace(
      'export default {',
      "export default {\n  type: 'content-api',"
    );
    fs.writeFileSync(choujiangRoutePath, content);
    console.log('✅ 修复 choujiang-ji-lu 路由配置');
  } else {
    console.log('ℹ️  choujiang-ji-lu 路由配置已正确');
  }
}

// 修复 yaoqing-jiangli 路由路径
const yaoqingRoutePath = path.join(__dirname, 'src/api/yaoqing-jiangli/routes/yaoqing-jiangli.ts');
if (fs.existsSync(yaoqingRoutePath)) {
  let content = fs.readFileSync(yaoqingRoutePath, 'utf8');
  
  // 修复路径不匹配问题
  content = content.replace(
    "/api/yaoqing-jianglis/invite-stats",
    "/api/yaoqing-jianglis/stats"
  );
  
  fs.writeFileSync(yaoqingRoutePath, content);
  console.log('✅ 修复 yaoqing-jiangli 路由路径');
}

// 修复 choujiang-ji-lu 路由路径
if (fs.existsSync(choujiangRoutePath)) {
  let content = fs.readFileSync(choujiangRoutePath, 'utf8');
  
  // 修复路径不匹配问题
  content = content.replace(
    "/choujiang/perform",
    "/api/choujiang-ji-lus/perform"
  );
  
  fs.writeFileSync(choujiangRoutePath, content);
  console.log('✅ 修复 choujiang-ji-lu 路由路径');
}

// 创建缺失的 webhook 路由
const webhookRoutePath = path.join(__dirname, 'src/api/webhook/routes/webhook.ts');
if (!fs.existsSync(webhookRoutePath)) {
  const webhookRouteContent = `export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/webhooks',
      handler: 'webhook.find',
    },
    {
      method: 'POST',
      path: '/api/webhooks',
      handler: 'webhook.create',
    },
  ],
};`;
  
  // 确保目录存在
  const webhookDir = path.dirname(webhookRoutePath);
  if (!fs.existsSync(webhookDir)) {
    fs.mkdirSync(webhookDir, { recursive: true });
  }
  
  fs.writeFileSync(webhookRoutePath, webhookRouteContent);
  console.log('✅ 创建 webhook 路由');
}

// 创建缺失的 webhook 控制器
const webhookControllerPath = path.join(__dirname, 'src/api/webhook/controllers/webhook.ts');
if (!fs.existsSync(webhookControllerPath)) {
  const webhookControllerContent = `import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::webhook.webhook', ({ strapi }) => ({
  // 继承默认的CRUD操作
}));`;
  
  // 确保目录存在
  const webhookControllerDir = path.dirname(webhookControllerPath);
  if (!fs.existsSync(webhookControllerDir)) {
    fs.mkdirSync(webhookControllerDir, { recursive: true });
  }
  
  fs.writeFileSync(webhookControllerPath, webhookControllerContent);
  console.log('✅ 创建 webhook 控制器');
}

// 创建缺失的 webhook 服务
const webhookServicePath = path.join(__dirname, 'src/api/webhook/services/webhook.ts');
if (!fs.existsSync(webhookServicePath)) {
  const webhookServiceContent = `import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::webhook.webhook', ({ strapi }) => ({
  // 继承默认的CRUD操作
}));`;
  
  // 确保目录存在
  const webhookServiceDir = path.dirname(webhookServicePath);
  if (!fs.existsSync(webhookServiceDir)) {
    fs.mkdirSync(webhookServiceDir, { recursive: true });
  }
  
  fs.writeFileSync(webhookServicePath, webhookServiceContent);
  console.log('✅ 创建 webhook 服务');
}

// 创建缺失的 webhook 内容类型
const webhookContentTypePath = path.join(__dirname, 'src/api/webhook/content-types/webhook/schema.json');
if (!fs.existsSync(webhookContentTypePath)) {
  const webhookSchemaContent = `{
  "kind": "collectionType",
  "collectionName": "webhooks",
  "info": {
    "singularName": "webhook",
    "pluralName": "webhooks",
    "displayName": "Webhook"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "url": {
      "type": "string",
      "required": true
    },
    "events": {
      "type": "json"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  }
}`;
  
  // 确保目录存在
  const webhookContentTypeDir = path.dirname(webhookContentTypePath);
  if (!fs.existsSync(webhookContentTypeDir)) {
    fs.mkdirSync(webhookContentTypeDir, { recursive: true });
  }
  
  fs.writeFileSync(webhookContentTypePath, webhookSchemaContent);
  console.log('✅ 创建 webhook 内容类型');
}

console.log('🎉 路由配置修复完成！');
console.log('📝 请重启 Strapi 服务器以应用更改');
console.log('💡 运行: npm run develop 或 yarn develop'); 