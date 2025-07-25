#!/bin/bash

echo "🔧 修复TypeScript错误..."

# 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.cache dist

# 重新构建
echo "🔨 重新构建项目..."
npm run build

# 检查是否还有错误
echo "✅ TypeScript错误修复完成！"
echo "现在可以重新启动Strapi服务了。" 