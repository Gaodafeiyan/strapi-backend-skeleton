# API接口问题修复指南

## 🚨 问题描述
- 所有自定义API返回404错误
- 管理后台功能正常，但REST API不可用
- 自定义API模块未正确注册

## 🔧 解决步骤

### 第一步：在服务器上执行修复脚本

```bash
# 1. 进入项目目录
cd /path/to/strapi-backend-skeleton

# 2. 给脚本执行权限
chmod +x deploy_fix.sh

# 3. 执行修复脚本
./deploy_fix.sh
```

### 第二步：检查数据库迁移

```bash
# 执行数据库迁移
node check_migration.js
```

### 第三步：验证API注册

```bash
# 检查API模块结构
node verify_api_registration.js
```

### 第四步：手动检查关键文件

#### 1. 检查 `src/index.ts`
确保文件内容正确：
```typescript
export default {
  register({ strapi }) {
    // 确保所有自定义API已注册
  },
  bootstrap({ strapi }) {
    // 确保所有服务已启动
  },
};
```

#### 2. 检查 `config/api.ts`
确保REST API已启用：
```typescript
export default () => ({
  rest: {
    enabled: true,
    prefix: '/api',
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
});
```

#### 3. 检查 `config/plugins.ts`
确保插件配置正确：
```typescript
export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});
```

### 第五步：重启服务

```bash
# 如果使用PM2
pm2 restart strapi-backend-skeleton

# 或者直接启动
npm run start
```

### 第六步：测试API

```bash
# 测试基础API
node test_basic_api.js

# 测试自定义API
node test_remote_api.js
```

## 🔍 故障排除

### 如果问题仍然存在：

#### 1. 检查启动日志
```bash
# 查看启动日志
npm run develop

# 或查看PM2日志
pm2 logs strapi-backend-skeleton
```

#### 2. 检查API注册
在启动日志中查找：
- `API registered` 消息
- 错误信息
- 模块加载状态

#### 3. 检查数据库连接
```bash
# 测试数据库连接
npm run strapi database:migrate:status
```

#### 4. 检查文件权限
```bash
# 确保文件权限正确
chmod -R 755 src/
chmod -R 755 config/
```

## 📋 验证清单

修复完成后，请验证以下项目：

- [ ] 服务器正常启动
- [ ] 管理后台可访问
- [ ] `/api/health` 返回200
- [ ] `/api/users` 返回200
- [ ] `/api/notices` 返回200（而不是404）
- [ ] `/api/qianbao-yues` 返回200（而不是404）
- [ ] 其他自定义API正常工作

## 🆘 如果仍然有问题

### 1. 检查Strapi版本兼容性
```bash
npm list @strapi/strapi
```

### 2. 清理并重新安装
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 3. 检查TypeScript编译
```bash
npm run strapi ts:generate-types
```

### 4. 联系技术支持
如果以上步骤都无法解决问题，请提供：
- 启动日志
- 错误信息
- 系统环境信息

## 🎯 预期结果

修复成功后，您应该能够：
- 访问所有自定义API端点
- 正常使用钱包、抽奖、认购等功能
- 管理后台和API都正常工作 