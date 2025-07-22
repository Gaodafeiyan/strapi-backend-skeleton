# 部署检查清单

## ✅ 代码完整性检查

### 核心功能文件
- [x] `src/api/webhook/controllers/webhook.ts` - Webhook控制器
- [x] `src/api/webhook/routes/webhook.ts` - Webhook路由
- [x] `src/crons/withdrawal-timeout.ts` - 超时Job
- [x] `tests/webhook.test.js` - Webhook测试
- [x] `tests/withdrawal-timeout.test.js` - 超时Job测试
- [x] `test-webhook-integration.js` - 集成测试
- [x] `quick-webhook-test.sh` - 快速测试脚本

### 文档文件
- [x] `WEBHOOK_INTEGRATION.md` - 详细使用文档
- [x] `ITERATION_1_SUMMARY.md` - 功能总结
- [x] `DEPLOYMENT_CHECKLIST.md` - 本检查清单

## 🔧 环境配置检查

### 必需的环境变量
```bash
# 数据库配置
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=

# JWT配置
JWT_SECRET=

# 管理员配置
ADMIN_JWT_SECRET=

# 应用配置
APP_KEYS=
API_TOKEN_SALT=
TRANSFER_TOKEN_SALT=
```

### 可选的环境变量
```bash
# 日志级别
LOG_LEVEL=info

# 端口配置
PORT=1337
HOST=0.0.0.0

# 时区
TZ=Asia/Shanghai
```

## 🚀 部署步骤

### 1. Git上传
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

### 3. 环境配置
```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量
nano .env

# 确保所有必需的环境变量都已设置
```

## 🧪 部署后测试

### 1. 服务健康检查
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

### 3. 数据库连接测试
```bash
# 检查数据库连接
curl http://localhost:1337/api/qianbao-chongzhis
```

### 4. Cron任务测试
```bash
# 手动触发超时检查任务
curl -X POST http://localhost:1337/api/cron/withdrawal-timeout
```

## 📊 监控检查

### 1. 日志监控
```bash
# 查看应用日志
tail -f logs/strapi.log

# 查看错误日志
tail -f logs/error.log
```

### 2. 性能监控
```bash
# 检查内存使用
free -h

# 检查磁盘使用
df -h

# 检查进程状态
ps aux | grep strapi
```

### 3. 网络监控
```bash
# 检查端口监听
netstat -tlnp | grep 1337

# 检查防火墙规则
iptables -L
```

## 🔒 安全检查

### 1. 权限检查
```bash
# 检查文件权限
ls -la

# 确保敏感文件不可读
chmod 600 .env
chmod 600 config/database.js
```

### 2. 网络安全
- [ ] 防火墙配置正确
- [ ] 只开放必要端口
- [ ] SSL证书配置（如果使用HTTPS）
- [ ] 反向代理配置（如果使用Nginx）

### 3. 数据库安全
- [ ] 数据库用户权限最小化
- [ ] 数据库连接使用SSL
- [ ] 定期备份配置

## 🚨 故障排查

### 常见问题
1. **服务无法启动**
   - 检查环境变量配置
   - 检查端口是否被占用
   - 查看错误日志

2. **数据库连接失败**
   - 检查数据库服务状态
   - 验证连接参数
   - 检查网络连接

3. **Webhook不响应**
   - 检查路由配置
   - 验证控制器代码
   - 查看请求日志

4. **Cron任务不执行**
   - 检查cron配置
   - 验证时间设置
   - 查看任务日志

### 调试命令
```bash
# 查看详细日志
DEBUG=* npm run develop

# 检查数据库迁移
npm run strapi database:migrate

# 重置数据库（谨慎使用）
npm run strapi database:reset
```

## ✅ 部署确认清单

- [ ] 代码已上传到Git
- [ ] 服务器已拉取最新代码
- [ ] 依赖已安装完成
- [ ] 环境变量已配置
- [ ] 服务已启动
- [ ] 健康检查通过
- [ ] Webhook功能测试通过
- [ ] 数据库连接正常
- [ ] 日志输出正常
- [ ] 监控配置完成

## 📞 紧急联系

如果部署过程中遇到问题：
1. 查看日志文件
2. 检查环境配置
3. 回滚到上一个稳定版本
4. 联系技术支持

---

**部署完成后，请运行测试脚本验证功能是否正常！** 