# Notice API 修复说明

## 🐛 问题描述

在服务器上启动Strapi时出现错误：

```
TypeError: Error creating endpoint GET /api/notices: Cannot read properties of undefined (reading 'kind')
```

## 🔍 问题原因

Notice API缺少必要的content-type配置：
- 缺少 `content-types/notice/schema.json` 文件
- 缺少 `services/notice.ts` 文件
- 控制器配置不完整

## 🔧 修复步骤

### 1. 创建content-type schema

在服务器上执行：

```bash
# 创建目录
mkdir -p src/api/notice/content-types/notice

# 创建schema.json文件
cat > src/api/notice/content-types/notice/schema.json << 'EOF'
{
  "kind": "collectionType",
  "collectionName": "notices",
  "info": {
    "singularName": "notice",
    "pluralName": "notices",
    "displayName": "Notice",
    "description": "系统公告"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "content": {
      "type": "richtext",
      "required": true
    },
    "type": {
      "type": "enumeration",
      "enum": [
        "info",
        "warning",
        "success",
        "error"
      ],
      "default": "info"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "publishDate": {
      "type": "datetime"
    },
    "expireDate": {
      "type": "datetime"
    },
    "priority": {
      "type": "integer",
      "default": 0,
      "min": 0,
      "max": 10
    }
  }
}
EOF
```

### 2. 创建服务文件

```bash
# 创建services目录
mkdir -p src/api/notice/services

# 创建notice.ts服务文件
cat > src/api/notice/services/notice.ts << 'EOF'
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::notice.notice', ({ strapi }) => ({
  // 获取活跃的公告
  async getActiveNotices() {
    const now = new Date();
    
    return await strapi.entityService.findMany('api::notice.notice', {
      filters: {
        isActive: true,
        publishedAt: { $notNull: true },
        $or: [
          { publishDate: { $lte: now } },
          { publishDate: { $null: true } }
        ],
        $or: [
          { expireDate: { $gte: now } },
          { expireDate: { $null: true } }
        ]
      },
      sort: { priority: 'desc', createdAt: 'desc' },
      populate: '*'
    });
  },

  // 获取最新公告
  async getLatestNotices(limit = 5) {
    const now = new Date();
    
    return await strapi.entityService.findMany('api::notice.notice', {
      filters: {
        isActive: true,
        publishedAt: { $notNull: true },
        $or: [
          { publishDate: { $lte: now } },
          { publishDate: { $null: true } }
        ],
        $or: [
          { expireDate: { $gte: now } },
          { expireDate: { $null: true } }
        ]
      },
      sort: { priority: 'desc', createdAt: 'desc' },
      limit,
      populate: '*'
    });
  }
}));
EOF
```

### 3. 更新控制器

```bash
# 更新控制器文件
cat > src/api/notice/controllers/notice.ts << 'EOF'
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notice.notice', ({ strapi }) => ({
  // 继承默认的CRUD操作

  // 获取活跃公告
  async getActiveNotices(ctx) {
    try {
      const notices = await strapi.service('api::notice.notice').getActiveNotices();
      ctx.body = { data: notices };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取最新公告
  async getLatestNotices(ctx) {
    try {
      const limit = parseInt(ctx.query.limit) || 5;
      const notices = await strapi.service('api::notice.notice').getLatestNotices(limit);
      ctx.body = { data: notices };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 重写find方法，默认只返回活跃的公告
  async find(ctx) {
    try {
      // 如果没有指定filters，默认只返回活跃的公告
      if (!ctx.query.filters) {
        ctx.query.filters = {
          isActive: true,
          publishedAt: { $notNull: true }
        };
      }
      
      const { data, meta } = await super.find(ctx);
      ctx.body = { data, meta };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
}));
EOF
```

### 4. 清理缓存并重启

```bash
# 清理缓存
rm -rf node_modules/.cache dist

# 重新启动Strapi
npm run develop
```

## ✅ 预期结果

修复后应该能够：

1. **成功启动Strapi** - 不再出现schema错误
2. **Notice API正常工作** - `/api/notices` 返回200或401
3. **前端可以正常调用** - 不再出现404错误

## 🧪 验证方法

启动后可以测试：

```bash
# 测试notice API
curl http://localhost:1337/api/notices

# 应该返回401（需要认证）而不是404
```

## 📝 注意事项

1. 确保所有文件都正确创建
2. 清理缓存很重要
3. 重启后检查Strapi管理面板中是否有Notice内容类型
4. 可以在管理面板中创建一些测试公告 