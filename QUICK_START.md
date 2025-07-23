# 🚀 快速启动指南

## 立即启动（跳过迁移）

```bash
# 1. 清理缓存
rm -rf node_modules/.cache dist .tmp/migrations/

# 2. 启动服务
npm run develop
```

## 如果遇到TypeScript错误

```bash
# 1. 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 2. 启动服务
npm run develop
```

## 验证服务是否正常

```bash
# 测试健康检查
curl http://localhost:1337/health

# 测试API接口
curl http://localhost:1337/api/dinggou-dingdans
```

## 常见问题解决

### 1. 数据库迁移错误
- 删除 `.tmp/migrations/` 文件夹
- 重新启动服务

### 2. TypeScript编译错误
- 清理缓存：`rm -rf node_modules/.cache dist`
- 重新启动：`npm run develop`

### 3. 端口被占用
```bash
# 查找占用进程
lsof -i :1337

# 杀死进程
kill -9 <PID>

# 或使用其他端口
HOST=0.0.0.0 PORT=1338 npm run develop
```

## 核心功能验证

启动后，以下功能应该正常工作：

- ✅ 投资订单管理
- ✅ 钱包余额操作
- ✅ 邀请奖励系统
- ✅ 抽奖功能
- ✅ 商城系统
- ✅ 用户管理

## 性能优化

系统已包含以下优化：

- 🔒 数据库事务保证数据一致性
- 🚀 并发控制防止竞态条件
- 🛡️ 完善的错误处理
- 📊 健康检查监控
- 🔍 详细的日志记录

**现在可以安全启动服务了！** 