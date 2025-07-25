#!/bin/bash

echo "🔧 开始修复API接口问题..."

# 1. 停止当前服务
echo "📦 停止当前服务..."
pm2 stop strapi-backend-skeleton || true
pkill -f "strapi" || true

# 2. 清理构建缓存
echo "🧹 清理构建缓存..."
rm -rf .cache
rm -rf build
rm -rf dist
rm -rf .tmp

# 3. 重新安装依赖
echo "📥 重新安装依赖..."
npm ci --production

# 4. 重新构建项目
echo "🔨 重新构建项目..."
npm run build

# 5. 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 6. 启动服务
echo "🚀 启动服务..."
npm run start

echo "�� 修复完成！请检查API是否正常工作" 