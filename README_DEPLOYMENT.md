# 🚀 部署指南

## 📋 部署前检查

### ✅ 已完成的功能
- [x] Webhook统一处理控制器
- [x] 超时Job自动处理
- [x] 幂等性保障
- [x] 完整测试覆盖
- [x] 详细文档

### 📁 新增文件清单
```
strapi-backend-skeleton/
├── src/
│   ├── api/webhook/
│   │   ├── controllers/webhook.ts      # Webhook控制器
│   │   └── routes/webhook.ts           # Webhook路由
│   └── crons/
│       └── withdrawal-timeout.ts       # 超时Job
├── tests/
│   ├── webhook.test.js                 # Webhook测试
│   └── withdrawal-timeout.test.js      # 超时Job测试
├── test-webhook-integration.js         # 集成测试
├── quick-webhook-test.sh              # 快速测试脚本
├── deploy.sh                          # 本地部署脚本
├── server-deploy.sh                   # 服务器部署脚本
├── WEBHOOK_INTEGRATION.md             # 详细文档
├── ITERATION_1_SUMMARY.md             # 功能总结
├── DEPLOYMENT_CHECKLIST.md            # 部署检查清单
└── README_DEPLOYMENT.md               # 本部署指南
```

## 🚀 快速部署步骤

### 1. 本地Git上传

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 完成迭代1 - Webhook自动确认和失败回滚功能

- 添加Webhook统一处理控制器
- 实现超时Job自动处理
- 添加幂等性保障
- 完成单元和集成测试
- 添加详细文档"

# 推送到远程仓库
git push origin main
```

### 2. 服务器部署

#### 方法一：使用部署脚本（推荐）
```bash
# 连接到服务器
ssh user@your-server

# 进入项目目录
cd /path/to/strapi-backend-skeleton

# 给脚本执行权限（Linux/Mac）
chmod +x server-deploy.sh

# 运行部署脚本
./server-deploy.sh
```

#### 方法二：手动部署
```bash
# 连接到服务器
ssh user@your-server

# 进入项目目录
cd /path/to/strapi-backend-skeleton

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 构建项目
npm run build

# 重启服务
pm2 restart strapi-backend
# 或者
systemctl restart strapi-backend
```

## 🧪 部署后测试

### 1. 健康检查
```bash
# 检查服务状态
curl http://localhost:1337/api/health

# 检查管理员面板
curl http://localhost:1337/admin
```

### 2. Webhook功能测试
```bash
# 运行快速测试
./quick-webhook-test.sh

# 运行完整集成测试
node test-webhook-integration.js
```

### 3. 手动测试Webhook
```bash
# 充值确认测试
curl -X POST http://localhost:1337/api/webhook/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xabc123",
    "status": "success",
    "type": "recharge"
  }'

# 提现确认测试
curl -X POST http://localhost:1337/api/webhook/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xdef456",
    "status": "success",
    "type": "withdrawal"
  }'
```

## 📊 监控和日志

### 查看日志
```bash
# 应用日志
tail -f logs/strapi.log

# 错误日志
tail -f logs/error.log

# PM2日志（如果使用PM2）
pm2 logs strapi-backend
```

### 监控服务状态
```bash
# PM2监控
pm2 monit

# 系统状态
systemctl status strapi-backend
```

## 🔧 环境配置

### 必需的环境变量
确保 `.env` 文件包含以下配置：

```bash
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret

# 管理员配置
ADMIN_JWT_SECRET=your_admin_jwt_secret

# 应用配置
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_api_token_salt
TRANSFER_TOKEN_SALT=your_transfer_token_salt
```

## 🚨 故障排查

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查环境变量
   cat .env
   
   # 检查端口占用
   netstat -tlnp | grep 1337
   
   # 查看详细错误
   npm run develop
   ```

2. **Webhook不响应**
   ```bash
   # 检查路由
   curl http://localhost:1337/api/webhook/transaction
   
   # 查看控制器日志
   tail -f logs/strapi.log | grep webhook
   ```

3. **Cron任务不执行**
   ```bash
   # 手动触发任务
   curl -X POST http://localhost:1337/api/cron/withdrawal-timeout
   
   # 检查cron配置
   cat src/crons/withdrawal-timeout.ts
   ```

### 回滚操作
```bash
# 回滚到上一个版本
git reset --hard HEAD~1

# 重新部署
./server-deploy.sh
```

## 📞 支持信息

### 文档链接
- [Webhook集成文档](./WEBHOOK_INTEGRATION.md)
- [功能总结](./ITERATION_1_SUMMARY.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)

### 测试脚本
- `quick-webhook-test.sh` - 快速功能测试
- `test-webhook-integration.js` - 完整集成测试

### 监控命令
```bash
# 服务状态
pm2 status

# 实时监控
pm2 monit

# 日志查看
tail -f logs/strapi.log
```

## ✅ 部署确认

部署完成后，请确认以下项目：

- [ ] 服务正常启动
- [ ] 健康检查通过
- [ ] Webhook功能测试通过
- [ ] 数据库连接正常
- [ ] 日志输出正常
- [ ] 监控配置完成

---

**🎉 恭喜！迭代1功能已成功部署！**

现在可以开始使用Webhook自动确认和失败回滚功能了。 