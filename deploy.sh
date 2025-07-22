#!/bin/bash

# 快速部署脚本
set -e

echo "🚀 开始部署 Strapi Backend..."

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

# 检查Git状态
log_info "检查Git状态..."
if [ -n "$(git status --porcelain)" ]; then
    log_warn "发现未提交的更改，是否提交？(y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git add .
        git commit -m "feat: 完成迭代1 - Webhook自动确认和失败回滚功能

- 添加Webhook统一处理控制器
- 实现超时Job自动处理
- 添加幂等性保障
- 完成单元和集成测试
- 添加详细文档"
    else
        log_error "请先提交更改再部署"
        exit 1
    fi
fi

# 推送到远程仓库
log_info "推送到远程仓库..."
git push origin main

log_info "✅ 代码已上传到Git"

# 检查环境变量
log_info "检查环境变量..."
if [ ! -f ".env" ]; then
    log_warn "未找到.env文件，是否从env.example复制？(y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        cp env.example .env
        log_warn "请编辑.env文件配置环境变量"
        exit 1
    else
        log_error "请先配置.env文件"
        exit 1
    fi
fi

# 安装依赖
log_info "安装依赖..."
npm install

# 构建项目
log_info "构建项目..."
npm run build

# 检查服务状态
log_info "检查服务状态..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "strapi-backend"; then
        log_info "重启PM2服务..."
        pm2 restart strapi-backend
    else
        log_info "启动PM2服务..."
        pm2 start npm --name "strapi-backend" -- run start
    fi
elif command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet strapi-backend; then
        log_info "重启systemctl服务..."
        sudo systemctl restart strapi-backend
    else
        log_info "启动systemctl服务..."
        sudo systemctl start strapi-backend
    fi
else
    log_warn "未找到PM2或systemctl，请手动启动服务"
fi

# 等待服务启动
log_info "等待服务启动..."
sleep 5

# 健康检查
log_info "执行健康检查..."
if curl -f http://localhost:1337/api/health > /dev/null 2>&1; then
    log_info "✅ 服务健康检查通过"
else
    log_error "❌ 服务健康检查失败"
    exit 1
fi

# 运行快速测试
log_info "运行快速测试..."
if [ -f "quick-webhook-test.sh" ]; then
    chmod +x quick-webhook-test.sh
    ./quick-webhook-test.sh
else
    log_warn "未找到快速测试脚本"
fi

log_info "🎉 部署完成！"
log_info "📊 服务地址: http://localhost:1337"
log_info "🔧 管理员面板: http://localhost:1337/admin"
log_info "📝 查看日志: tail -f logs/strapi.log" 