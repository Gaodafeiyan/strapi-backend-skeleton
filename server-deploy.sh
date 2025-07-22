#!/bin/bash

# 服务器端部署脚本
set -e

echo "🚀 开始服务器端部署..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 备份当前版本
log_info "备份当前版本..."
if [ -d "dist" ]; then
    cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)
fi

# 拉取最新代码
log_info "拉取最新代码..."
git fetch origin
git reset --hard origin/main

# 检查环境变量
log_info "检查环境变量..."
if [ ! -f ".env" ]; then
    log_error "未找到.env文件，请先配置环境变量"
    exit 1
fi

# 安装依赖
log_info "安装依赖..."
npm ci --production

# 构建项目
log_info "构建项目..."
npm run build

# 数据库迁移
log_info "执行数据库迁移..."
npm run strapi database:migrate

# 重启服务
log_info "重启服务..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "strapi-backend"; then
        pm2 restart strapi-backend
        log_info "✅ PM2服务已重启"
    else
        pm2 start npm --name "strapi-backend" -- run start
        log_info "✅ PM2服务已启动"
    fi
elif command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet strapi-backend; then
        sudo systemctl restart strapi-backend
        log_info "✅ systemctl服务已重启"
    else
        sudo systemctl start strapi-backend
        log_info "✅ systemctl服务已启动"
    fi
else
    log_warn "未找到PM2或systemctl，请手动重启服务"
fi

# 等待服务启动
log_info "等待服务启动..."
sleep 10

# 健康检查
log_info "执行健康检查..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:1337/api/health > /dev/null 2>&1; then
        log_info "✅ 服务健康检查通过"
        break
    else
        log_warn "尝试 $attempt/$max_attempts: 服务还未就绪，等待5秒..."
        sleep 5
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    log_error "❌ 服务健康检查失败，请检查日志"
    exit 1
fi

# 运行功能测试
log_info "运行功能测试..."
if [ -f "quick-webhook-test.sh" ]; then
    chmod +x quick-webhook-test.sh
    if ./quick-webhook-test.sh; then
        log_info "✅ 功能测试通过"
    else
        log_warn "⚠️ 功能测试失败，请检查日志"
    fi
else
    log_warn "未找到快速测试脚本"
fi

# 清理备份
log_info "清理旧备份..."
find . -name "dist.backup.*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

# 显示服务状态
log_info "显示服务状态..."
if command -v pm2 &> /dev/null; then
    pm2 status
elif command -v systemctl &> /dev/null; then
    systemctl status strapi-backend --no-pager -l
fi

log_info "🎉 服务器部署完成！"
log_info "📊 服务地址: http://localhost:1337"
log_info "🔧 管理员面板: http://localhost:1337/admin"
log_info "📝 查看日志: tail -f logs/strapi.log"
log_info "📊 监控状态: pm2 monit (如果使用PM2)" 